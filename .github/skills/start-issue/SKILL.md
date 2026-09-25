---
name: start-issue
disable-model-invocation: true
argument-hint: "Issue number/URL, or an explicit branch name for non-issue work"
description: "Read a Gitea issue, investigate it, choose a planning mode (simple or grilling), create the branch from main after approval, and hand off to start-implementation. Use when picking up an assigned issue."
---

# Start Issue

Orchestrate picking up an issue end to end: read → investigate → choose a planning mode → plan → approve → branch → start implementation. No git changes happen before the plan is approved.

## When to Use

- You were assigned a Gitea issue and are about to start work on it.
- You say "start #42", "pick up issue 42", "read #42 and plan it", or "/start-issue 42".
- You need a branch for work that has no issue and you provide the branch name yourself.

## Inputs

- An issue number (`42`), `#42`, or a full issue URL, or
- An explicit branch name to use verbatim, or
- Both: the explicit branch name overrides the name derived from the issue, and the issue is still read for context.

When only an explicit branch name is provided, skip steps 1–5 and go straight to branch creation (step 6). If no input is provided, ask for one.

## Flow

### 1. Read the issue

- Confirm `tea` is available and authenticated with `tea --version` and `tea whoami`. If it is unavailable, stop and report.
- Read the issue with `tea issue "$ISSUE_ID"`, adding `--comments` when the discussion matters for context.
- Capture the title, state, body, assignees, and relevant comments.
- Warn, but continue, when the issue is closed or is not assigned to the current user. Compare the `tea whoami` username with the issue assignees.
- Never comment on, relabel, self-assign, or otherwise modify the issue.

### 2. Investigate

- Read the relevant code and conventions (repo `AGENTS.md` files) before proposing anything.
- Assess scope and complexity: subsystems touched, contract/schema/API changes, architectural impact, requirement clarity, and unknown unknowns.
- Change nothing: this phase is read-only.

### 3. Recommend a planning mode

Present a recommendation with a one or two sentence rationale, and ask the user to choose:

- **Simple plan** — recommended when the change is localized, within one area, requirements are clear, and no schema/API/contract or architectural changes are involved.
- **Grilling plan** — recommended when the investigation reveals multiple subsystems, schema/API/contract changes, new architecture, ambiguous requirements, or many unknown unknowns.
- **Stop** — when the user only wanted context or triage.

Never start planning without the user's choice. Use the `grilling` skill only when it was chosen.

### 4. Plan

- **Simple plan:** propose a concise plan in the conversation — approach, affected areas/files, ordered steps, validation strategy, and risks. Invite revisions.
- **Grilling plan:** load the `grilling` skill and follow it for the issue's scope. Run its rounds until the frontier is empty and the user confirms shared understanding, then consolidate the resulting decisions into the implementation plan.

This phase makes no git changes.

### 5. Approve

- Present the final plan, including the proposed branch name derived with the Branch Naming rules below (unless an explicit name was given).
- Ask: approve and create the branch, revise the plan, or stop.
- Branch creation happens only after explicit approval.

### 6. Create the branch

1. **Pre-flight checks.**
   - Confirm this is a git working directory with `git rev-parse --is-inside-work-tree`.
   - Check the working tree with `git status --porcelain`.
   - If the tree is dirty, stop and ask the user to commit or stash first. Never stash automatically and never carry uncommitted changes onto the new branch.

2. **Finalize the branch name.**
   - Use the approved name, the explicit override, or `<type>/<slug>` derived with the Branch Naming rules.
   - Validate it with `git check-ref-format --branch "$BRANCH_NAME"`. If validation fails, stop and report.

3. **Refresh `main`.**
   - `git fetch origin`
   - `git switch main` — if no local `main` exists, use `git switch --create main --track origin/main`.
   - `git pull --ff-only`
   - If any of these fail, stop and report. Never create the branch from a stale or diverged `main`.

4. **Check for collisions.**
   - Local: `git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"`.
   - Remote: `git show-ref --verify --quiet "refs/remotes/origin/$BRANCH_NAME"`.
   - If a local branch exists, stop and report. Do not check it out, overwrite it, or silently reuse it, even when it is the current branch.
   - If only a remote branch exists, stop and ask whether to track the existing branch instead. Do not silently reuse it.

5. **Create and push.**

   ```bash
   git switch --create "$BRANCH_NAME"
   git push --set-upstream origin "$BRANCH_NAME"
   ```

   - If the push fails, keep the local branch and report the exact error plus the manual command. Never force-push and never delete the branch.

6. **Report the result.**
   - Branch name, base (`main` at its current short hash), upstream (`origin/<branch>`), and HEAD hash.
   - The source issue number and title when an issue was used.
   - Note that pull requests from this branch target `uat` by default (see `create-pr`).

### 7. Hand off to implementation

- When a plan exists (the issue path, or an explicit branch with a plan already agreed in the conversation), load the `start-implementation` skill and continue with it.
- First ask for the execution mode, with a recommendation and rationale:
  - **All in one go** — recommended for small, tightly coupled plans (≤3 TODOs, single area).
  - **TODO by TODO** — recommended for larger or cross-area plans.
- Follow the loaded skill with the chosen mode.
- When only an explicit branch name was given and no plan exists in the conversation, stop after the branch report.

## Branch Naming

Default format: `<type>/<kebab-slug>`.

Derive the type prefix from the `[Type]` prefix in the issue title:

| Issue title prefix | Branch prefix |
| ------------------ | ------------- |
| `[Bug]`            | `bugfix/`     |
| `[Feature]`        | `feat/`       |
| `[Enhancement]`    | `feat/`       |
| `[Documentation]`  | `docs/`       |
| `[Security]`       | `security/`   |
| `[Testing]`        | `test/`       |

If the title has no recognizable `[Type]` prefix, ask which prefix to use. Never guess a prefix.

Derive the slug from the issue title:

1. Drop the leading `[Type]` prefix.
2. Lowercase the remaining text.
3. Replace every run of non-alphanumeric characters with a single `-`.
4. Trim leading and trailing `-`.
5. Cap at 8 words or 60 characters, whichever is shorter, trimming at the last whole word.

Examples:

- `[Feature] Add tenant credit gate enforcement` → `feat/add-tenant-credit-gate-enforcement`
- `[Bug] React Flow nodes fail to render on initial load` → `bugfix/react-flow-nodes-fail-to-render-on-initial`

Do not include the issue number in the branch name.

## Failure and Partial States

- Steps 1–5 (read, investigate, plan, approve) make no git changes.
- Branch pre-flight failures (dirty tree, invalid or undeterminable branch name, collision, fetch/pull failure) create nothing; report the exact error and the manual command.
- A push failure leaves the local branch in place. Report it; do not force-push, retry blindly, or delete.
- Uncommitted work is never stashed, discarded, or carried over by this skill.

## Quality Criteria

- The planning mode was recommended with a rationale and chosen by the user; the `grilling` skill runs only when chosen.
- No git changes happen before the plan is approved.
- The issue was read for context and never modified.
- The branch name follows `<type>/<slug>` unless the user provided one verbatim.
- The branch is created from the latest `main` only after a successful `git pull --ff-only`.
- The working tree was clean before branching; uncommitted changes were not silently moved.
- Existing local or remote branches were never overwritten or silently reused.
- Upstream tracking is set, or the push failure is reported.
- Implementation continued through `start-implementation` with the chosen execution mode.
- The report includes the branch name, base, upstream, and source issue when applicable.

## See Also

- `grilling` — deep planning when the issue warrants it.
- `start-implementation` — implement the approved plan in the chosen execution mode.
- `create-pr` — open the pull request once the work is committed.
