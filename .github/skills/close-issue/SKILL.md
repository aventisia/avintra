---
name: close-issue
disable-model-invocation: true
argument-hint: "Issue number or URL and optional closing comment"
description: "Close an existing Gitea issue, optionally adding a user-provided comment first. Use when the user asks to close, resolve, or mark an issue as done."
---

# Close Gitea Issue

Close an existing Gitea issue, with an optional comment recorded before closing.

## When to Use

- The user says "close issue #42", "resolve this issue", or "mark #42 as done".
- The user provides an issue number or URL and an optional closing comment.
- The user explicitly wants an issue closed without adding a comment.

## Procedure

1. **Collect the issue identifier.**
   - Accept a plain number (`42`), `#42`, or a full issue URL.
   - If no issue is specified, ask for it.

2. **Collect the optional comment.**
   - Use the comment supplied by the user verbatim.
   - If no comment is supplied, skip the comment step and close the issue directly.
   - Do not invent a comment or ask for one when the user did not provide it.

3. **Add the comment when provided.**

   ```bash
   tea comment "$ISSUE_ID" "$COMMENT"
   ```

   If the comment contains multiple lines or shell-sensitive characters, pass it using a safely quoted shell variable or another equivalent shell-safe method.

4. **Close the issue.**

   ```bash
   tea issue close "$ISSUE_ID"
   ```

5. **Report the result.**
   - Confirm the issue was closed and include the issue number or URL when available.
   - If a comment was supplied, confirm that it was added before closing.
   - If `tea` is not installed, report the exact commands the user can run manually.
   - If either command fails, report the exact failure and do not claim the issue was closed.

## Quality Criteria

- An issue identifier is explicitly provided or requested before any command runs.
- A supplied comment is preserved verbatim and added before the close operation.
- No comment is created when the user did not provide one.
- The result accurately reflects whether the comment and close operations succeeded.
