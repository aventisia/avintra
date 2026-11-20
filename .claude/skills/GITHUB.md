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

Every `gh` call on an issue or pull request carries `--repo "$REPO"` (`gh api` takes `repos/$REPO/...` in its path instead). The project calls below are the exception: `gh project` takes `--owner aventisia`, and `gh api graphql` takes the owner and name as variables.

## Projects

Two organization projects under `aventisia` own the issues in `aventisia` repositories; an issue elsewhere belongs to neither. Every issue carries exactly one `Kind/*` label, and that label alone names its project, so the skills never ask and never leave an issue on both.

| Project          | Number | `Kind/*` labels                                                          |
| ---------------- | ------ | ------------------------------------------------------------------------ |
| Bug Triage       | 17     | `Kind/Bug`, `Kind/Security`                                              |
| Platform Roadmap | 18     | `Kind/Feature`, `Kind/Enhancement`, `Kind/Documentation`, `Kind/Testing` |

`Kind/Security` means a security defect; a security feature carries `Kind/Feature` or `Kind/Enhancement` and goes to the roadmap.

### Place an issue

Project automation is a backstop, not the placement: an Auto-add workflow can be missing or match the wrong labels, and "Auto-add sub-issues to project" adds a sub-issue to its parent's project whatever its kind. So whenever a skill creates or refines an issue in an `aventisia` repository, it places the issue itself, even when the kind is unchanged. `$TO` is the number the label names, `$FROM` the other one:

```bash
URL=$(gh issue view --repo "$REPO" "$ID" --json url -q .url)
gh project item-add "$TO" --owner aventisia --url "$URL"
ITEM=$(gh api graphql -F owner="${REPO%/*}" -F name="${REPO#*/}" -F n="$ID" \
  -f query='query($owner:String!,$name:String!,$n:Int!){repository(owner:$owner,name:$name){issue(number:$n){projectItems(first:20){nodes{id project{number}}}}}}' \
  --jq ".data.repository.issue.projectItems.nodes[] | select(.project.number == $FROM) | .id")
if [ -n "$ITEM" ]; then gh project item-delete "$FROM" --owner aventisia --id "$ITEM"; fi
gh issue view --repo "$REPO" "$ID" --json projectItems --jq '[.projectItems[].title] | join(", ")'
```

`item-add` succeeds when the issue is already on that project, so the block is safe to rerun and needs no membership check first. The last line reads the placement back; report that, not the intended project. `item-delete` detaches the item from that project only; the issue is untouched. These calls, the read-back included, need the token's `project` scope, which `gh auth status` lists. Without it, tell the user before approval that `gh auth refresh -s project` grants it; if they go ahead without it, skip placement and report the project the label names for them to place the issue.

For issues filed outside the skills, each project's Auto-add workflow should filter on its row: `is:issue label:Kind/Bug,Kind/Security` for Bug Triage, `is:issue label:Kind/Feature,Kind/Enhancement,Kind/Documentation,Kind/Testing` for Platform Roadmap.

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
