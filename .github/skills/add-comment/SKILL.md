---
name: add-comment
disable-model-invocation: true
argument-hint: "Issue number or URL and optional comment"
description: "Add a user-approved comment to an existing Gitea issue. Use with /add-comment #<issue_number> <comment>; if the comment is omitted, draft one from the current plan or summarized work and ask for confirmation before posting."
---

# Add Gitea Issue Comment

Add a comment to an existing Gitea issue so later planning, brainstorming, implementation decisions, and completed work are preserved on the issue.

## When to Use

- The user invokes `/add-comment #<issue_number> <comment>`.
- The user provides an issue number or URL and asks to record a plan, decision, task, investigation result, or implementation update.
- The user omits the comment and wants the current conversation's plan or work summary captured on the issue.

## Procedure

1. **Collect the issue identifier.**
   - Accept a plain number (`42`), `#42`, or a full issue URL.
   - The issue identifier is required. If it is missing, ask for it and do not run any command.
   - Preserve a full issue URL when supplied; otherwise use the issue number accepted by `tea`.

2. **Prepare the comment.**
   - If the user supplied a comment, preserve its wording and Markdown exactly. Do not rewrite, expand, or add details unless the user asks.
   - If no comment was supplied, draft a concise Markdown comment from the current conversation. Prefer concrete decisions, implementation steps, affected areas, validation checks, open questions, and completed work over generic summaries.
   - Do not invent facts, test results, files, decisions, or completion status. If there is not enough current context to draft a useful comment, ask the user what should be recorded.

3. **Show the draft and confirm.**
   - Always present the exact comment that would be posted and ask the user to confirm or edit it before running `tea comment`.
   - Do not post the comment until the user explicitly confirms the draft. A correction or replacement from the user becomes the new draft and must be confirmed.
   - If the user explicitly provided a comment in the same request, still show the exact comment and request confirmation before posting.

4. **Add the confirmed comment.**

   ```bash
   tea comment "$ISSUE_ID" "$COMMENT"
   ```

   For multiline comments or shell-sensitive characters, use a safely quoted shell variable or an equivalent shell-safe method. Preserve Markdown and line breaks.

5. **Report the result.**
   - Confirm that the comment was added and include the issue number or URL.
   - If `tea` is not installed, report that it could not be executed and provide the exact command the user can run manually.
   - If the command fails, report the exact failure and do not claim that the comment was added.

## Quality Criteria

- An issue identifier is explicitly provided before any command runs.
- The comment is either preserved verbatim from the user or grounded only in the current conversation.
- The exact final draft is shown and explicitly confirmed before posting.
- No comment is posted when the user has not confirmed it.
- Markdown, multiline content, and shell-sensitive characters are passed safely.
- Success and failure are reported accurately.
