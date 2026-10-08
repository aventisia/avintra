---
name: code-review
user-invocable: true
argument-hint: "Code snippet, diff, commit, file, or Gitea PR (#123 / PR URL) to review; optional review focus or constraints"
description: "Review generated code for standard industry practices, structural integrity, and maintainability. Focuses on architecture, modularity, reuse, documentation, dead code, and maintainability issues. Accepts a Gitea PR number and fetches its changed files via the tea CLI."
---

# Code Review

Review generated code with a strict senior-developer lens. Prioritize standard industry practices, structural integrity, and maintainability over vague explanations or cosmetic polish.

## When to Use

- When asked to perform a code review on a generated code snippet or commit.
- When asked to evaluate the approach taken by an AI or check code quality.
- When a solution needs a hard pass/fail review for maintainability and industry-standard structure.
- When a Gitea pull request is referenced (`#123`, `123`, or a PR URL) and its changed files should be reviewed.

## Gitea PR Input

When the review target is a Gitea pull request, fetch it with the `tea` CLI instead of asking the user to paste the diff. This path is read-only: never comment on, approve, reject, or merge the PR — hand that off to `merge-pr`.

### 1. Detect the PR reference

- Accept `#123`, a bare `123`, or a full PR URL (e.g. `https://gitea.aventisia.com/aventisia/worc-platform/pulls/123`).
- Extract the numeric index into `$PR_ID` and resolve the repository into `$REPO` before fetching:
  - For a bare number or `#123`, use the current checkout as `$REPO` (for example, `.`).
  - For a full URL, parse its `owner/repo` and use that slug as `$REPO`; do not discard the repository from the URL.
  - If the URL requires a non-default Gitea login (for example, because it uses a different host), set `$LOGIN` to that configured login. If no login is configured, stop and ask for access or a local checkout.
- Pass `--repo "$REPO"` to every repository-scoped `tea pr` and `tea api` command. For a non-default login, also pass `--login "$LOGIN"`.
- If more than one PR is referenced, ask which one to review.
- If the reference is ambiguous with an issue number, confirm whether it is a PR before fetching.

### 2. Verify the CLI

- Confirm `tea` is available with `tea --version`. Verify the default login with `tea whoami`; for a non-default `$LOGIN`, verify it with the read-only request `tea api --login "$LOGIN" /user`.
- If `tea` is unavailable or not authenticated, stop and report the exact error. Ask the user for the diff or a local branch instead of guessing.

### 3. Fetch the PR overview

```bash
tea pr --repo "$REPO" \
  --fields index,title,state,author,base,head,body,mergeable,ci "$PR_ID"
```

- Capture the title, state, author, base/head branches, description, CI status, and mergeability. If approval status matters, also inspect the PR's review records:

  ```bash
  tea api --repo "$REPO" "/repos/{owner}/{repo}/pulls/$PR_ID/reviews"
  ```

- Add `--login "$LOGIN"` to both requests when using a non-default login. Check review states rather than inferring approval from the PR state.
- Warn, but continue, if the PR is closed.

### 4. Fetch the changed files

```bash
PAGE=1
tea api --include --repo "$REPO" \
  "/repos/{owner}/{repo}/pulls/$PR_ID/files?page=$PAGE&limit=50"
```

- Add `--login "$LOGIN"` when using a non-default login. The `{owner}` and `{repo}` placeholders resolve from the repository selected by `--repo`.
- The response is a JSON array with `filename`, `status`, `additions`, `deletions`, and `changes` per file. This endpoint is paginated: inspect the `X-HasMore` response header and increment `$PAGE` until it is `false`. Include every page in the file list and diffstat before reviewing.
- To print each page's file summary, pipe its JSON body through a JSON tool. `--include` writes headers to stderr, leaving the JSON body available on stdout:

```bash
tea api --include --repo "$REPO" \
  "/repos/{owner}/{repo}/pulls/$PR_ID/files?page=$PAGE&limit=50" \
  | python3 -c "import sys,json; [print(f['status'], f['additions'], f['deletions'], f['filename']) for f in json.load(sys.stdin)]"
```

Repeat for every page before treating the list or diffstat as complete.

### 5. Fetch the unified diff

```bash
tea api --repo "$REPO" "/repos/{owner}/{repo}/pulls/$PR_ID.diff"
```

- Review the unified diff as the primary artifact. Use `patch` instead of `diff` only when commit-level context is needed.
- Add `--login "$LOGIN"` when using a non-default login.
- For a large PR, save the diff to a temporary file with `tea api --output` and inspect it in manageable chunks.
- If local checkout is necessary to inspect PR-head files, use a disposable worktree or clone. Never run `tea pr checkout` in the user's active worktree; compare the PR head against the fetched base there, then remove only the temporary worktree created for the review.

### 6. Review against project conventions

- Read the relevant repo `AGENTS.md` files and each touched feature's local `README.md` before judging structure or conventions.
- If a changed file cannot be fetched or is binary/generated, say so explicitly rather than reviewing it blindly.

## Core Rules

### 1. Documentation and Comment Density

- Follow the repository `AGENTS.md` documentation boundaries: no inline comments explaining syntax or internal logic; require self-documenting names instead.
- Require short JSDoc/XML only for exported interfaces, public APIs, and complex type definitions; internal functions and variables must stay undocumented.
- Reject long or redundant public summaries; each should be one short sentence describing the contract, not the implementation.
- Reject large functions that depend on explanatory comments; require decomposition and precise naming instead of labeled chunks.
- The only permitted inline comments are `IMPORTANT NOTE:` warnings about external system constraints, race conditions, or required hacks.

### 2. File Structure and Modularity

- Flag implementations that cram everything into a single file.
- Enforce separation of concerns.
- Require distinct files for different components, models, utilities, services, and integrations.
- Prefer clear domain boundaries and single-responsibility organization.

### 3. Code Reuse

- Identify places where new logic was created instead of reusing existing methods, utilities, hooks, helpers, or libraries.
- Demand reuse of available project abstractions to reduce duplication and follow DRY principles.
- Flag copy-pasted implementations that duplicate patterns already used elsewhere.

### 4. Dead Code Elimination

- Check whether recent changes or the new code have left variables, functions, classes, imports, or branches unused or obsolete.
- Flag dead code for removal, especially if it creates cognitive overhead or breaks maintainability.
- Do not allow stale scaffolding or temporary logic to remain in production code.

### 5. Critical Issues & Logic Flaws

- Explicitly scan for critical vulnerabilities, logic flaws, race conditions, and unhandled exceptions that could crash the application or cause data loss.
- Identify potential security risks (e.g., missing authentication/authorization, injection flaws, memory leaks, unhandled promises).
- Check for breaking changes to state, APIs, or data models that affect production reliability.

## Approach

- Act as a strict senior developer.
- Review the code for sound engineering decisions, not just correctness.
- Group the findings into these logical sections:
  - Critical Issues & Bugs
  - Architecture/Modularity
  - Code Reuse
  - Documentation/Comments
  - Dead Code
  - General Quality
- When reviewing a diff or commit, assess whether the implementation stays consistent with the existing project structure and conventions.
- When the target is a Gitea PR, base the review on the fetched unified diff and reference each finding by changed file path.
- Call out concrete issues with file names, code regions, or patterns rather than vague criticism.
- If the code is missing required context, say what information is needed before a reliable review can be completed.

## Output Format

Return the review in this structure:

### 1. Critical Issues & Bugs

Highlight any logic flaws, security vulnerabilities, race conditions, unhandled exceptions, or breaking changes. This is the highest priority section.

### 2. Architecture / Modularity

Flag oversized files, poor separation of concerns, unclear responsibilities, and structural problems.

### 3. Code Reuse

Point out duplication, copied logic, or failure to reuse existing project utilities.

### 4. Documentation / Comments

Call out undocumented exported/public APIs, over-long JSDoc, and inline comments that restate code.
Confirm the only inline comments are `IMPORTANT NOTE:` warnings about external constraints, race conditions, or required hacks.

### 5. Dead Code

Identify obsolete imports, temporary branches, unused fields, or stale functions that should be removed.

### 6. General Quality

Highlight naming, edge cases, clarity, maintainability, and any other engineering issues that reduce code quality.

### 7. Verdict

End with a concise recommendation: pass, needs revision, or reject for maintainability or structural issues.

## Review Standard

The review should be exacting but fair. Do not nitpick formatting unless it materially impacts readability or maintenance. Focus on whether the code is robust, modular, readable at a glance, and consistent with standard engineering practices.

## Quality Criteria

- A referenced Gitea PR is fetched via `tea` and its changed files are reviewed, rather than asking the user to paste the diff.
- The changed-file list and diffstat are stated before the findings so scope is explicit.
- The review is read-only: the PR is never commented on, approved, rejected, or merged.
- If `tea` is unavailable or the PR cannot be fetched, the exact blocker is reported and a fallback is offered.
- Findings reference concrete changed file paths.
- Documentation boundaries are enforced: no implementation comments, short docs only on public boundaries, and only `IMPORTANT NOTE:` inline exceptions.

## See Also

- `merge-pr` — land the reviewed PR once it is ready.
- `create-pr` — open the pull request this skill reviews.
