---
name: merge-pr
disable-model-invocation: true
argument-hint: "PR number or URL, and optional merge style (squash, rebase, merge)"
description: "Merge a reviewed GitHub pull request once it is open, mergeable, and passing CI."
---

# Merge Pull Request

Land a reviewed GitHub pull request.

Read [`../GITHUB.md`](../GITHUB.md) first. It governs authorization, target resolution, request scoping, and outcome reporting for every step below.

## Steps

1. **Resolve the PR** per `GITHUB.md`.

2. **Pick the merge style**: the user's choice among `squash`, `rebase`, and `merge`, else `squash` without asking. Always pass the matching `--squash`, `--rebase`, or `--merge` flag; `gh` otherwise prompts.

3. **Check readiness.**

   ```bash
   gh pr view --repo "$REPO" "$PR_ID" --json number,title,state,baseRefName,headRefName,mergeable,statusCheckRollup
   ```

   The PR is ready when it is open, mergeable, and CI is not failing. Otherwise name the specific blocker and stop. Continue past a blocker only when the user explicitly overrides that blocker and GitHub permits the merge.

4. **Merge.**

   ```bash
   gh pr merge --repo "$REPO" "--$MERGE_STYLE" "$PR_ID"
   ```

5. **Report** per `GITHUB.md`, with the resulting commit SHA when available. On failure, also give the exit code and suggest only next steps the actual error supports.
