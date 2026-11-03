# Gitea Targeting with `tea`

Shared reference for skills that read or change Gitea issues and pull requests. The remote tracker is Gitea, driven by the `tea` CLI.

## Authorization

The mutating skills (`add-comment`, `close-issue`, `create-issue`, `create-pr`, `merge-pr`, `refine-issue`) run only on the user's explicit request in a primary session. QA success, a finished plan, or an agent handoff never authorizes them.

## Resolve the target

1. Accept `42`, `#42`, or a full issue/PR URL. With no reference, ask for one before running any command; with several, ask which one.
2. **Full URL**: take the index, host, and `owner/repo` from it and set `REPO` to that slug. When the host is not the default login's, set `LOGIN` to the configured login for that host (`tea login list`). No configured login for the host → stop and ask for access.
3. **Bare number**: the target is the current checkout (`REPO=.`) once you confirm it is the intended repository. A same-numbered issue or PR in another repository is a different target.
4. **Verify the CLI**: `tea --version`, then `tea whoami` for the default login or `tea api --login "$LOGIN" /user` for another. On failure, stop and report the exact error.

## Scope every request

Every `tea` call carries `--repo "$REPO"`, plus `--login "$LOGIN"` whenever a non-default login is in use. The skills' command examples show `--repo` only; add `--login` wherever it applies.

## Pass text safely

Pass titles, bodies, and comments through a quoted variable filled from a quoted heredoc, so Markdown, line breaks, backticks, and `$` arrive verbatim:

```bash
BODY=$(cat <<'EOF'
<text>
EOF
)
```

## Report the outcome

- **Success**: the number and URL `tea` returned.
- **Failure**: the exact command and error, secrets redacted. Report only what actually happened; when a multi-step operation stops partway, say which steps succeeded.
- **`tea` missing**: the exact command for the user to run manually, with an offer to write long text to a file.
