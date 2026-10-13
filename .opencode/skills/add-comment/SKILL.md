---
name: add-comment
disable-model-invocation: true
argument-hint: "Issue number or URL and optional comment"
description: "Add a user-requested comment to a Gitea issue, preserving repository scope and confirming agent-drafted text before posting."
---

# Add Gitea Issue Comment

Add a comment to an existing Gitea issue so planning, decisions, investigation, or completed work is preserved on the intended issue.

This is a standalone, user-invoked lifecycle operation outside the coding loop. Require suitable permissions and explicit mutation authorization; QA success alone does not authorize posting.

## When to Use

- The user invokes `/add-comment #<issue_number> <comment>`.
- The user provides an issue number or URL and asks to record a plan, decision, task, investigation result, or implementation update.
- The user omits the comment and wants the current conversation's plan or work summary captured on the issue.

## Procedure

1. **Resolve the issue and repository.**
   - Accept a plain number (`42`), `#42`, or a full issue URL. If it is missing, ask for it and do not run any command.
   - For a full URL, extract the issue index, host, and `owner/repo`; preserve them in every request. Use `--repo "$REPO"` and, for a non-default configured host, `--login "$LOGIN"`.
   - For a bare number, confirm the current checkout is the intended repository and set `REPO` to `.`. Never silently use the same number in another repository.
   - Confirm `tea --version` and `tea whoami`; for a non-default login, verify it with the read-only request `tea api --login "$LOGIN" /user`. If the host has no configured login, stop and ask for access.

2. **Prepare the comment.**
   - If the user supplied a comment, preserve its wording and Markdown exactly. Do not rewrite, expand, or add details unless the user asks.
   - If no comment was supplied, draft a concise Markdown comment from the current conversation. Prefer concrete decisions, implementation steps, affected areas, validation checks, open questions, and completed work over generic summaries.
   - Do not invent facts, test results, files, decisions, or completion status. If there is not enough current context to draft a useful comment, ask the user what should be recorded.

3. **Confirm agent-drafted text.**
   - If the comment is agent-drafted or modified, present the exact text and obtain explicit confirmation before posting. A correction becomes a new draft and must be confirmed.
   - If the user supplied the exact text and explicitly requested that it be posted, that request authorizes the verbatim comment; do not require a redundant confirmation.

4. **Add the confirmed comment.**

   ```bash
   tea comments add "$ISSUE_ID" "$COMMENT" --repo "$REPO"
   ```

   Add `--login "$LOGIN"` for a non-default login. For multiline comments or shell-sensitive characters, use a safely quoted shell variable or an equivalent shell-safe method. Preserve Markdown and line breaks.

5. **Report the result.**
   - Confirm that the comment was added and include the issue number or URL.
   - If `tea` is not installed, report that it could not be executed and provide the exact command the user can run manually.
   - If the command fails, report the exact failure and do not claim that the comment was added.

## Quality Criteria

- The issue and repository are resolved before any command runs; a full URL's host/repository are preserved.
- The comment is either preserved verbatim from the user or grounded only in the current conversation.
- Agent-drafted or modified text is shown and explicitly confirmed before posting.
- Verbatim user text is posted only when the user explicitly requested the comment.
- Markdown, multiline content, and shell-sensitive characters are passed safely.
- Success and failure are reported accurately.
