---
name: create-pr
disable-model-invocation: true
argument-hint: "Title, description, head branch, and base branch for the PR"
description: "Create a Gitea pull request once implementation, commits, and local validation are complete. Use when the current branch is ready to merge into staging/uat or main."
---

# Create Gitea Pull Request

Open a pull request on Gitea after implementation is done and the current branch is ready to merge.

## When to Use

- The user says "create a PR", "open a pull request", "merge this to uat", or "raise a PR for this change".
- Local implementation is complete, changes are committed, and the current branch is ready for review.
- The target branch is `uat` (also called `staging`), `main`, or another protected branch.

## What This Skill Does

- Determines the current branch as the PR head.
- Collects or confirms the base branch from the user.
- Uses the provided title and description (or composes them from the commit history if missing).
- Runs `tea pr create` and reports the PR URL.

## Procedure

1. **Validate state.**
   - Confirm the working tree is clean and there are commits on the current branch that are not on the base branch.
   - If there are uncommitted changes, stop and ask the user to commit or stash them first.

2. **Determine head branch.**
   - Read the current branch with `git branch --show-current`.
   - Use that as the PR head unless the user specifies another branch.

3. **Determine base branch.**
   - If the user does not mention a target branch, default the base branch to `uat`.
   - Only use `main` as the base branch when the user explicitly requests it (e.g., hotfix to production).
   - If the target branch is ambiguous, confirm with the user before proceeding.
   - The repo convention is that feature PRs target `uat` (also called `staging`) unless the user explicitly says `main`.

4. **Collect title and description.**
   - Use the title and description the user provided.
   - If no description was provided, use the commit messages of the unpushed commits on the current branch.
   - If no title was provided, use the first line of the most recent commit message or ask the user.

5. **Create the pull request.**

   ```bash
   tea pr create \
     --title "$TITLE" \
     --description "$DESCRIPTION" \
     --head "$HEAD_BRANCH" \
     --base "$BASE_BRANCH"
   ```

   For multi-line descriptions with quotes, prefer writing the body to a temporary file:

   ```bash
   tea pr create \
     --title "$TITLE" \
     --description "$(cat /tmp/pr-body.md)" \
     --head "$HEAD_BRANCH" \
     --base "$BASE_BRANCH"
   ```

6. **Report the result.**
   - Share the PR number and URL returned by `tea`.
   - If `tea` is not installed, report the exact command the user can run manually and offer to write the PR body to a file.

## Quality criteria

- The working tree is clean before creating the PR.
- Head branch is the current branch unless the user overrides it.
- Base branch is explicitly chosen by the user or follows the repo convention (`uat` for features, `main` for hotfixes).
- Title and description are descriptive and reflect the actual changes.
- The PR URL or manual fallback is reported back to the user.
- No extra fields (reviewers, labels, milestones) are invented unless the user explicitly asks for them.
