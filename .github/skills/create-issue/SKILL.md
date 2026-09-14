---
name: create-issue
disable-model-invocation: true
argument-hint: "Title and body for the new Gitea issue"
description: "Create a Gitea issue to track an investigation outcome, agreed plan, or implementation task. Use after the agent and user have reached a mutual understanding and want to preserve the decision before coding starts."
---

# Create Gitea Issue

Persist a decided plan or investigation outcome as a Gitea issue before implementation begins.

## When to Use

- The user and agent have finished investigating or planning and reached a shared understanding.
- The user says something like "create an issue for this", "track this in Gitea", "let's open a ticket before we start", or "file this plan".
- The goal is to capture the agreed plan, problem statement, and next steps so implementation can be tracked and reviewed later.

## What the Issue Should Contain

- A clear, action-oriented title.
- A body that captures the mutual understanding: problem/context, decisions made, and the plan to implement.
- If the user supplied a file path, use the file contents as the body rather than summarizing it.

## Procedure

1. **Confirm the intent.**
   - If a plan or investigation result is already in the conversation, proceed.
   - If the context is unclear, ask the user what should go into the issue before creating it.

2. **Collect the title.**
   - Use the title the user provided.
   - If none was provided, ask for one. Keep it concise and action-oriented (under 120 characters).

3. **Collect the body.**
   - If the user provided a file path, read it and use the contents as the body.
   - If the user provided inline text, use it directly.
   - If neither was provided but a plan exists in the conversation, compose the body from the agreed plan and ask the user to confirm or edit before publishing.
   - Preserve Markdown formatting.

4. **Create the issue.**

   ```bash
   tea issue create --title "$TITLE" --description "$BODY"
   ```

   For multi-line bodies with quotes, prefer writing the body to a temporary file and passing it safely:

   ```bash
   tea issue create --title "$TITLE" --description "$(cat /tmp/issue-body.md)"
   ```

5. **Report the result.**
   - Share the issue number and URL returned by `tea`.
   - If `tea` is not installed, report the exact command the user can run manually and offer to write the issue body to a file.

## Quality criteria

- Title is non-empty, descriptive, and action-oriented.
- Body reflects the agreed plan or investigation outcome, not a generic summary.
- The issue URL or manual fallback is reported back to the user.
- No extra fields (labels, assignees, milestones) are invented unless the user explicitly asks for them.
