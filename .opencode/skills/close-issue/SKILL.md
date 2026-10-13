---
name: close-issue
disable-model-invocation: true
argument-hint: "Issue number or URL and optional closing comment"
description: "Close an existing Gitea issue, optionally adding a user-provided comment first. Use when the user asks to close, resolve, or mark an issue as done."
---

# Close Gitea Issue

Close an existing Gitea issue, with an optional comment recorded before closing.

This is a standalone, user-invoked lifecycle operation outside the coding loop. Require suitable permissions and explicit mutation authorization; QA success alone does not authorize closure.

## When to Use

- The user says "close issue #42", "resolve this issue", or "mark #42 as done".
- The user provides an issue number or URL and an optional closing comment.
- The user explicitly wants an issue closed without adding a comment.

## Procedure

1. **Resolve the issue and repository.**
   - Accept a plain number (`42`), `#42`, or a full issue URL. If no issue is specified, ask for it.
   - For a full URL, extract the issue index, host, and `owner/repo`; preserve them in every request. Use `--repo "$REPO"` and, for a non-default configured host, `--login "$LOGIN"`.
   - For a bare number, confirm the current checkout is the intended repository and set `REPO` to `.`. Never silently close the same number in another repository.
   - Confirm `tea --version` and `tea whoami`; for a non-default login, verify it with the read-only request `tea api --login "$LOGIN" /user`. If the host has no configured login, stop and ask for access.

2. **Collect the optional comment.**
   - Use the comment supplied by the user verbatim.
   - If no comment is supplied, skip the comment step and close the issue directly.
   - Do not invent a comment or ask for one when the user did not provide it.

3. **Add the comment when provided.**

    ```bash
    tea comments add "$ISSUE_ID" "$COMMENT" --repo "$REPO"
    ```

    Add `--login "$LOGIN"` for a non-default login. If the comment contains multiple lines or shell-sensitive characters, pass it using a safely quoted shell variable or another equivalent shell-safe method. If adding the comment fails, stop; do not close the issue without the requested comment.

4. **Close the issue.**

    ```bash
    tea issues close "$ISSUE_ID" --repo "$REPO"
    ```

    Add `--login "$LOGIN"` for a non-default login. If closing fails after a comment was added, report that the comment succeeded but the issue remains open.

5. **Report the result.**
   - Confirm the issue was closed and include the issue number or URL when available.
   - If a comment was supplied, confirm that it was added before closing.
   - If `tea` is not installed, report the exact commands the user can run manually.
   - If either command fails, report the exact failure and do not claim the issue was closed.

## Quality Criteria

- The issue and repository are resolved before any command runs; a full URL's host/repository are preserved.
- A supplied comment is preserved verbatim and added before the close operation.
- No comment is created when the user did not provide one.
- The result accurately reflects whether the comment and close operations succeeded.
