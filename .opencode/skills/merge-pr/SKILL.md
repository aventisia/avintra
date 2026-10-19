---
name: merge-pr
disable-model-invocation: true
argument-hint: "PR number or URL, and optional merge style (squash, rebase, merge, rebase-merge)"
description: "Merge a reviewed Gitea pull request once it is open, mergeable, and passing CI."
---

# Merge Pull Request

Land a reviewed Gitea pull request.

Read [`../GITEA.md`](../GITEA.md) first. It governs authorization, target resolution, request scoping, and outcome reporting for every step below.

## Steps

1. **Resolve the PR** per `GITEA.md`.

2. **Pick the merge style**: the user's choice among `squash`, `rebase`, `merge`, and `rebase-merge`, else `squash` without asking. `tea` itself defaults to `merge`, so always pass `--style`.

3. **Check readiness.**

   ```bash
   tea pulls --repo "$REPO" --fields index,title,state,base,head,mergeable,ci "$PR_ID"
   ```

   The PR is ready when it is open, mergeable, and CI is not failing. Otherwise name the specific blocker and stop. Continue past a blocker only when the user explicitly overrides that blocker and Gitea permits the merge.

4. **Merge.**

   ```bash
   tea pulls merge --repo "$REPO" --style "$MERGE_STYLE" "$PR_ID"
   ```

5. **Report** per `GITEA.md`, with the resulting commit SHA when available. On failure, also give the exit code and suggest only next steps the actual error supports.
