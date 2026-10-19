# Loading a Gitea PR for Review

Fetch the PR with `tea` rather than asking the user to paste a diff. Every request here is read-only.

## 1. Resolve the PR

Resolve the reference and verify `tea` per [`../GITEA.md`](../GITEA.md). When the number could equally be an issue, confirm it is a PR before fetching. If `tea` is unavailable or unauthenticated, report the exact error and ask for the diff or a local branch instead.

## 2. Fetch the overview

```bash
tea pulls --repo "$REPO" --fields index,title,state,author,base,head,body,mergeable,ci "$PR_ID"
```

Note title, state, author, base/head, description, CI, and mergeability. A closed PR gets a warning, and the review continues. When approval status matters, read the review records and judge approval from their states, not from the PR state:

```bash
tea api --repo "$REPO" "/repos/{owner}/{repo}/pulls/$PR_ID/reviews"
```

## 3. Fetch the changed files

The endpoint is paginated at 50 files. Walk pages from `PAGE=1` until the `X-HasMore` header is `false`. The file list and diffstat are complete only after the last page. `--include` writes headers to stderr, so stdout stays pure JSON:

```bash
tea api --include --repo "$REPO" \
  "/repos/{owner}/{repo}/pulls/$PR_ID/files?page=$PAGE&limit=50" \
  | python3 -c "import sys,json; [print(f['status'], f['additions'], f['deletions'], f['filename']) for f in json.load(sys.stdin)]"
```

## 4. Fetch the diff

```bash
tea api --repo "$REPO" "/repos/{owner}/{repo}/pulls/$PR_ID.diff"
```

The unified diff is the primary review artifact. Swap `.diff` for `.patch` only when commit-level context matters. Read a large diff in chunks.

## Full-file context

Review from the diff unless a finding needs surrounding code. Then inspect PR-head files only in an isolated checkout prepared for you: by the user when standalone, or by coder through the orchestrator inside the agent loop. Your own worktree stays as it is, so `tea pulls checkout` never runs there. Before trusting that checkout, match its commit to the fetched PR-head SHA. In the report, record what was reviewed diff-only, with full context, or by execution.
