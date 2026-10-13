---
name: merge-pr
disable-model-invocation: true
argument-hint: "PR number or URL and optional merge style (squash, rebase, merge, rebase-merge)"
description: "Merge an existing Gitea pull request if it has no conflicts and checks pass. Use after a PR has been reviewed and the user wants to land the change."
---

# Merge Pull Request

Merge a Gitea pull request when it is ready to land.

This is a standalone, user-invoked lifecycle operation outside the coding loop. Require suitable permissions and explicit mutation authorization; QA success alone does not authorize it.

## When to Use

- The user says "merge this PR", "merge #42", "land the change", or "squash and merge".
- The PR has been reviewed, CI checks are passing, and there are no merge conflicts.
- The user explicitly asked to merge after creating or reviewing a PR.

## What This Skill Does

- Resolves the PR index, host, and repository from the user input.
- Uses the requested merge style or defaults to `squash` without an extra prompt.
- Checks PR state, CI, and mergeability before running `tea pulls merge`.
- Reports success or the exact blocker.

## Procedure

1. **Resolve the PR and repository.**
   - Accept a plain number (`42`), `#42`, or a full PR URL.
   - If no PR is specified, ask for it.
   - For a full URL, extract the PR index, host, and `owner/repo`; preserve them in every request. Use `--repo "$REPO"` and, for a non-default configured host, `--login "$LOGIN"`.
   - For a bare number, confirm the current checkout is the intended repository and set `REPO` to `.`. Never merge a same-number PR in another repository.
   - Confirm `tea --version` and `tea whoami`; for a non-default login, verify it with the read-only request `tea api --login "$LOGIN" /user`. If the host has no configured login, stop and ask for access.

2. **Select the merge style.**
   - Use the style the user explicitly provided; otherwise use `squash`.
   - Accept only `squash`, `rebase`, `merge`, or `rebase-merge`.

3. **Check PR readiness.**
    - Inspect state, base/head, CI, and mergeability with `tea pulls --repo "$REPO" --fields index,title,state,base,head,mergeable,ci "$PR_ID"`. Add `--login "$LOGIN"` for a non-default login.
   - If the PR is closed, checks fail, or it is not mergeable, warn and stop. Continue only after the user explicitly overrides the specific blocker and Gitea permits the operation.

4. **Attempt the merge.**

   ```bash
    tea pulls merge --style "$MERGE_STYLE" --repo "$REPO" "$PR_ID"
    ```

    Add `--login "$LOGIN"` for a non-default login.

5. **Report the result.**
   - On success, confirm the merge and share the resulting commit SHA if available.
   - On failure, report the exact command, exit code, and actual error (redacting secrets). Do not speculate about conflicts or CI; suggest only next steps supported by that evidence.

## Quality criteria

- PR number is explicitly provided or confirmed before merging.
- Merge style uses the user's choice or defaults to `squash` without prompting.
- Repository identity is preserved for full URLs and every `tea` request is scoped.
- State, CI, and mergeability are checked before attempting the merge.
- Success or the exact failure reason is reported back to the user.
- The user is not asked for extra actions unless the merge fails.
