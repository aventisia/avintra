---
name: add-comment
disable-model-invocation: true
argument-hint: "Issue number or URL, and optional comment text"
description: "Add a comment to a Gitea issue: the user's text verbatim, or a confirmed draft from the conversation."
---

# Add Gitea Issue Comment

Record a plan, decision, investigation result, or work update on an existing Gitea issue.

Read [`../GITEA.md`](../GITEA.md) first. It governs authorization, target resolution, request scoping, safe text passing, and outcome reporting for every step below.

## Steps

1. **Resolve the issue** per `GITEA.md`.

2. **Prepare the comment.**
   - User-supplied text is the comment, verbatim, Markdown included.
   - With no text, draft concise Markdown from the current conversation: decisions, implementation steps, affected areas, validation run, open questions, completed work. Every fact traces to this conversation. When it holds too little to record, ask the user what to record.

3. **Confirm.** Show the exact text of any drafted or modified comment and wait for explicit approval; a correction is a new draft. Verbatim user text that the user asked to post is already approved.

4. **Post.**

   ```bash
   tea comments add --repo "$REPO" "$ISSUE_ID" "$COMMENT"
   ```

5. **Report** per `GITEA.md`, with the issue number or URL.
