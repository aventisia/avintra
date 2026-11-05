# Loading a GitHub PR for Review

Fetch the PR with `gh` rather than asking the user to paste a diff. Every request here is read-only.

## 1. Resolve the PR

Resolve the reference and verify `gh` per [`../GITHUB.md`](../GITHUB.md). When the number could equally be an issue, confirm it is a PR before fetching. If `gh` is unavailable or unauthenticated, report the exact error and ask for the diff or a local branch instead.

## 2. Fetch the overview

```bash
gh pr view --repo "$REPO" "$PR_ID" \
  --json number,title,state,author,baseRefName,headRefName,headRefOid,body,mergeable,statusCheckRollup
```

Note title, state, author, base/head, description, CI, and mergeability. A closed PR gets a warning, and the review continues. When approval status matters, read the review records and judge approval from their states, not from the PR state:

```bash
gh api "repos/$REPO/pulls/$PR_ID/reviews" --paginate
```

## 3. Fetch the changed files

`--paginate` walks every page, so the file list and diffstat are complete:

```bash
gh api "repos/$REPO/pulls/$PR_ID/files" --paginate \
  --jq '.[] | "\(.status) \(.additions) \(.deletions) \(.filename)"'
```

## 4. Fetch the diff

```bash
gh pr diff --repo "$REPO" "$PR_ID"
```

The unified diff is the primary review artifact. Use `gh pr diff --patch` only when commit-level context matters. Read a large diff in chunks.

## Full-file context

Review from the diff unless a finding needs surrounding code. Then inspect PR-head files only in an isolated checkout prepared for you: by the user when standalone, or by coder through the orchestrator inside the agent loop. Your own worktree stays as it is, so `gh pr checkout` never runs there. Before trusting that checkout, match its commit to the fetched `headRefOid`. In the report, record what was reviewed diff-only, with full context, or by execution.
