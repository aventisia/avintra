---
name: create-pr
disable-model-invocation: true
argument-hint: "Optional title, description, head branch, base branch, or repository URL"
description: "Open a GitHub pull request from a committed, pushed branch, confirming any drafted title or description."
---

# Create GitHub Pull Request

Open a pull request on GitHub once implementation is committed and the branch is ready for review.

Read [`../GITHUB.md`](../GITHUB.md) first. It governs authorization, repository resolution, request scoping, safe text passing, and outcome reporting for every step below.

## Steps

1. **Resolve the repository** per `GITHUB.md`: the user-supplied repository or URL, else the current checkout's `origin`. Same branch names in another repository make it a different target.

2. **Pick the branches.**
   - **Head**: the user's branch, else `git branch --show-current`.
   - **Base**: the user's branch, else `uat`. Use `main` only on explicit request (for example, a production hotfix). Confirm with the user when the target is ambiguous.

3. **Check readiness.** Run `git fetch origin`, then confirm all of:
   - The working tree is clean. With uncommitted changes, stop and ask the user to commit or explicitly exclude them; leave the changes where they are.
   - The head exists on the remote with no local commits missing from it (`git rev-list --count origin/$HEAD_BRANCH..$HEAD_BRANCH` is `0`). Push only when the user asks.
   - The head has commits the base lacks (`git log --oneline origin/$BASE_BRANCH..origin/$HEAD_BRANCH` is non-empty).

4. **Settle the title and description.**
   - User-supplied text is used verbatim.
   - Missing pieces are drafted from that commit log: the title from the primary change, the description from the commits. Show any draft and wait for explicit approval.

5. **Create the PR.**

   ```bash
   gh pr create \
     --repo "$REPO" \
     --head "$HEAD_BRANCH" \
     --base "$BASE_BRANCH" \
     --title "$TITLE" \
     --body "$DESCRIPTION"
   ```

   Reviewers, labels, milestones, and assignees are added only when the user asks.

6. **Report** per `GITHUB.md`, with the PR number and URL.
