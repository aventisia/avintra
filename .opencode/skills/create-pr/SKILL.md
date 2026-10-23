---
name: create-pr
disable-model-invocation: true
argument-hint: "Repository or PR URL, title, description, head branch, and optional base branch"
description: "Create a Gitea pull request after confirming repository scope, branch readiness, and any generated PR text."
---

# Create Gitea Pull Request

Open a pull request on Gitea after implementation is done and the current branch is ready to merge.

This is a standalone, user-invoked lifecycle operation outside the coding loop. Require suitable permissions and explicit mutation authorization; QA success alone does not authorize it.

## When to Use

- The user explicitly asks to create or open a pull request.
- Local implementation is complete, changes are committed, and the current branch is ready for review.
- The target branch is `uat` (also called `staging`), `main`, or another protected branch.

## What This Skill Does

- Determines the current branch as the PR head.
- Collects or confirms the base branch from the user.
- Uses the provided title and description or proposes generated text for confirmation.
- Runs `tea pulls create` with the confirmed repository and reports the PR URL.

## Procedure

1. **Validate state.**
   - Confirm `tea --version` and authentication with `tea whoami`; for a non-default login, verify it with `tea api --login "$LOGIN" /user`.
   - Resolve the current repository from the Gitea remote or the user-supplied repository/URL. For a URL, preserve host and `owner/repo`; pass `--repo "$REPO"` and `--login "$LOGIN"` for a non-default login. Never create a PR in another repository merely because it has the same branch or PR number.
   - Confirm the working tree is clean and there are commits on the current branch that are not on the base branch.
   - Confirm the proposed head branch is available on the remote. Do not push it unless the user explicitly asks.
   - If there are uncommitted changes, stop and ask the user to commit or explicitly exclude them; never stash automatically.

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
    - If no description was provided, draft it from the commits to be included.
    - If no title was provided, draft one from the primary change.
    - Show any generated title or description and obtain confirmation before creating the PR. Preserve explicitly supplied text verbatim.

5. **Create the pull request.**

    ```bash
    tea pulls create \
      --repo "$REPO" \
      --title "$TITLE" \
      --description "$DESCRIPTION" \
      --head "$HEAD_BRANCH" \
      --base "$BASE_BRANCH"
    ```

    Add `--login "$LOGIN"` for a non-default login. Use a safely quoted `--description "$DESCRIPTION"` argument for multi-line text. Omit optional fields only when the user has not supplied them.

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
