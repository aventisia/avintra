---
name: scout
disable-model-invocation: true
argument-hint: "Gitea issue number or URL"
description: "Scout a Gitea issue, verify a focused investigation report with the user, create and push its branch, then stop for a fresh Architect session."
---

# Scout an Issue

Stage 1 of the issue workflow: read the issue, investigate enough to identify the relevant code and boundaries, save the scout report, create the issue branch, and stop. Do not design or implement the solution here.

## Session Boundary

Each stage runs in its own fresh session and uses a different model from the preceding stage. The human starts the next stage; never load or invoke it from this session.

## When to Use

- The user asks to scout or investigate a Gitea issue, such as `start #42` or `/scout 42`.
- The input is an issue number (`42`, `#42`) or a Gitea issue URL.

If no issue reference is provided, ask for one. This skill is issue-only; do not infer a branch-only workflow.

## Procedure

### 1. Read the issue

- Confirm `tea` is available and authenticated with `tea --version` and `tea whoami`. If unavailable or unauthenticated, stop and report the exact error.
- Resolve the issue number and repository from the input, then read it with `tea issue "$ISSUE_ID" --comments` when comments are available and relevant. For a URL to another repository, scope the `tea` request to that repository and its configured login; never silently read the same number from the current repository.
- Record its title, state, body, assignees, acceptance criteria, and relevant discussion.
- Compare `tea whoami` with the issue assignees. Warn, but continue, if it is closed or not assigned to the current user.
- Never comment on, relabel, self-assign, or otherwise modify the issue.

### 2. Preliminary investigation

- Read the root and relevant area `AGENTS.md` files and any affected feature's local `README.md` before searching deeply.
- Do a bounded first pass to identify likely subsystems, entry points, existing behavior, and missing requirements.
- Keep this pass read-only. Do not modify implementation files.

### 3. Ask focused questions when needed

- Ask only questions raised by the issue and preliminary investigation that affect scope, expected behavior, compatibility, or which areas need investigation.
- Do not ask questions already answered by the issue, comments, or repository behavior.
- If the requirements are clear enough to investigate, continue without a question round.
- Use the answers to focus the full investigation; record the answers and any remaining assumptions.

### 4. Complete the investigation

- Trace the relevant existing behavior through code, callers, contracts, schemas, configuration, and tests as applicable.
- Inspect neighboring conventions, area-specific `AGENTS.md` files, and local feature `README.md` files.
- Verify every proposed manifest path exists. Include the symbol or behavior to inspect and why it is relevant.
- Separate confirmed findings from hypotheses, open questions, and unrelated paths that were checked and excluded.
- Do not propose a detailed implementation plan or change code; planning belongs to `architect`.

### 5. Save and verify the scout report

Before writing the report, verify this is a Git worktree and inspect `git status --porcelain --untracked-files=all`. The tree must be clean, except when resuming with only this issue's matching scout report from an interrupted run. If other changes exist, stop and ask the user to commit or stash them; never stash automatically.

Save the report at the repository root as:

```text
local-issues/<issue-number>/s1-scout-report.md
```

Create the issue directory if needed. If this report already exists from an interrupted Scout stage, review and update it; do not overwrite unrelated content. Leave any legacy `01-scout-report.md` untouched.

Include concise sections for:

- Issue metadata, request, and acceptance criteria.
- Relevant user answers, assumptions, and unresolved questions.
- Findings about current behavior and the relevant code/data flow.
- A verified file and symbol manifest, with a short reason for each entry.
- Relevant contracts, schemas, APIs, tests, configuration, or dependencies.
- Risks, investigation boundaries, and paths checked but excluded as noise.

Present the report summary and file manifest to the user. Wait for corrections or confirmation that the manifest is suitable for the Architect. Incorporate requested additions/removals and save the final report before continuing.

### 6. Create the issue branch

Branch creation happens only after the user verifies the scout report. Never discard or silently carry unrelated work onto the branch.

1. Recheck `git status --porcelain --untracked-files=all`. The only new/modified path may be this issue's scout report; if any other changes exist, stop and ask the user to commit or stash them. Never stash automatically.
2. Derive the proposed branch name using the rules below. If the issue title has no recognized type prefix, ask the user which prefix to use.
3. Validate with `git check-ref-format --branch "$BRANCH_NAME"`.
4. Run `git fetch origin`; stop if it fails or `origin/main` is unavailable. Check collisions:
   - Local: `git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"`.
   - Remote: `git show-ref --verify --quiet "refs/remotes/origin/$BRANCH_NAME"`.
   If either branch exists, stop and ask; do not overwrite or silently reuse it.
5. Create the branch from the fetched `origin/main` and push it:

   ```bash
   git switch --create "$BRANCH_NAME" origin/main
   git push --set-upstream origin "$BRANCH_NAME"
   ```

   The scout report may remain untracked in the same worktree during the branch switch. If Git reports a conflict or any unexpected worktree state, stop without cleaning it up. If push fails, keep the local branch and report the exact error; never force-push or delete it.
6. Report the branch, `origin/main` base hash, upstream, HEAD hash, issue number/title, and scout report path. Note that pull requests from this branch target `uat` by default (see `create-pr`).

Do not commit or otherwise modify the issue or implementation as part of branch creation.

### 7. Complete Scout stage and stop

After branch creation, report the issue, branch, scout-report path, and any push failure. Say the next step is `architect` in a fresh session using a different model (recommended: advanced reasoning). Do not load or invoke that skill, start planning, or continue into another stage. Stop here.

## Branch Naming

Default format: `<type>/<kebab-slug>`. Derive the type from the leading `[Type]` in the issue title:

| Issue title prefix | Branch prefix |
| --- | --- |
| `[Bug]` | `bugfix/` |
| `[Feature]` | `feat/` |
| `[Enhancement]` | `feat/` |
| `[Documentation]` | `docs/` |
| `[Security]` | `security/` |
| `[Testing]` | `test/` |

Derive the slug from the title by dropping `[Type]`, lowercasing, replacing each run of non-alphanumeric characters with `-`, trimming edge hyphens, and limiting it to 8 words or 60 characters (whichever is shorter, ending on a whole word). Do not include the issue number.

Examples:

- `[Feature] Add tenant credit gate enforcement` → `feat/add-tenant-credit-gate-enforcement`
- `[Bug] React Flow nodes fail to render on initial load` → `bugfix/react-flow-nodes-fail-to-render-on-initial`

## Quality Criteria

- The issue was read but never modified.
- Questions were targeted to investigation-relevant unknowns; irrelevant code was excluded with rationale.
- The final scout report exists at `local-issues/<issue-number>/s1-scout-report.md` and its file manifest was verified by the user.
- The branch was created from fetched `origin/main` only after report confirmation; unrelated work was not moved.
- The branch is pushed with upstream tracking, or the exact push failure is reported.
- The user receives the issue number and scout report path for a fresh Architect session; this session stops without invoking another stage.

## See Also

- `architect` — turn the scout report into an approved implementation plan.
- `build` — slice and implement the approved plan.
- `audit` — review the implementation against the approved plan.
