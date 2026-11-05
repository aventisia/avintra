# GitHub Targeting with `gh`

Shared reference for skills that read or change GitHub issues and pull requests. The remote tracker is GitHub (`aventisia/avintra`), driven by the `gh` CLI. Issues up to #559 were migrated from the archived Gitea `aventisia/worc-platform` with their numbers kept; each links back to its Gitea original.

## Authorization

The mutating skills (`add-comment`, `close-issue`, `create-issue`, `create-pr`, `merge-pr`, `refine-issue`) run only on the user's explicit request in a primary session. QA success, a finished plan, or an agent handoff never authorizes them.

## Resolve the target

1. Accept `42`, `#42`, or a full issue/PR URL. With no reference, ask for one before running any command; with several, ask which one.
2. **Full URL**: take the number and `owner/repo` from it and set `REPO` to that slug. When the host is not `github.com`, set `GH_HOST` to it only if `gh auth status` lists that host; otherwise stop and ask for access.
3. **Bare number**: the target is the current checkout's `origin` (`REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)`) once you confirm it is the intended repository. A same-numbered issue or PR in another repository is a different target.
4. **Verify the CLI**: `gh --version`, then `gh auth status`. On failure, stop and report the exact error.

## Scope every request

Every `gh` call carries `--repo "$REPO"` (`gh api` takes `repos/$REPO/...` in its path instead).

## Pass text safely

Pass titles, bodies, and comments through a quoted variable filled from a quoted heredoc, so Markdown, line breaks, backticks, and `$` arrive verbatim:

```bash
BODY=$(cat <<'EOF'
<text>
EOF
)
```

A bare `@name` notifies that GitHub user; write roles, placeholders, and code (`@reviewer`, `@types/node`) in backticks.

## Report the outcome

- **Success**: the number and URL `gh` returned.
- **Failure**: the exact command and error, secrets redacted. Report only what actually happened; when a multi-step operation stops partway, say which steps succeeded.
- **`gh` missing**: the exact command for the user to run manually, with an offer to write long text to a file.
