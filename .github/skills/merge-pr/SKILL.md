---
name: merge-pr
disable-model-invocation: true
argument-hint: "PR number and optional merge style (squash, rebase, merge)"
description: "Merge an existing Gitea pull request if it has no conflicts and checks pass. Use after a PR has been reviewed and the user wants to land the change."
---

# Merge Pull Request

Merge a Gitea pull request when it is ready to land.

## When to Use

- The user says "merge this PR", "merge #42", "land the change", or "squash and merge".
- The PR has been reviewed, CI checks are passing, and there are no merge conflicts.
- The user explicitly asked to merge after creating or reviewing a PR.

## What This Skill Does

- Reads the PR number from the user.
- Asks for the merge style if not provided (default `squash`).
- Runs `tea pr merge` and reports success or failure.
- Stops and explains if the merge fails due to conflicts or failing checks.

## Procedure

1. **Collect the PR number.**
   - Accept a plain number (`42`), `#42`, or a full PR URL.
   - If no PR is specified, ask for it.

2. **Confirm the merge style.**
   - Ask the user whether to use `squash`, `rebase`, or `merge`.
   - Default to `squash` if the user does not specify.

3. **Check PR readiness (best effort).**
   - Optionally inspect the PR status with `tea pr "$PR_ID"` first.
   - If the PR is closed or checks are failing, warn the user and stop unless they explicitly override.

4. **Attempt the merge.**

   ```bash
   tea pr merge "$PR_ID" --style "$MERGE_STYLE"
   ```

5. **Report the result.**
   - On success, confirm the merge and share the resulting commit SHA if available.
   - On failure, explain that the likely cause is merge conflicts or failing CI checks, and suggest resolving manually.

## Quality criteria

- PR number is explicitly provided or confirmed before merging.
- Merge style is chosen by the user or defaults to `squash`.
- The PR is not merged blindly if status checks or conflicts are known to block it.
- Success or the exact failure reason is reported back to the user.
- The user is not asked for extra actions unless the merge fails.
