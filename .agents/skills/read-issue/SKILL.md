---
name: read-issue
disable-model-invocation: true
argument-hint: "Issue number or URL to read"
description: "Load a Gitea issue into the conversation context by issue number or URL. Use when the user refers to an existing issue, asks to continue work on an issue, or wants the agent to consider an issue before planning or implementing."
---

# Read Gitea Issue

Load a Gitea issue into the conversation so the agent can use it as context for planning, investigation, or implementation.

## When to Use

- The user mentions an issue number or URL and asks to continue, fix, or implement it.
- The user says "read issue #42", "look at this ticket", "bring issue 123 into context", or "start work on #7".
- The agent needs issue details (title, body, status, comments) before proposing a plan or writing code.

## Procedure

1. **Collect the issue identifier.**
   - Accept a plain number (`42`), `#42`, or a full issue URL.
   - If no identifier is provided, ask for it.

2. **Run the read command.**

   ```bash
   tea issue "$ISSUE_ID"
   ```

   To include comments, use:

   ```bash
   tea issue "$ISSUE_ID" --comments
   ```

3. **Load the result into context.**
   - Include the issue title, state (open/closed), body, and relevant comments in the conversation context.
   - If the command returns JSON, parse it; otherwise capture the text output.

4. **Confirm next steps.**
   - Summarize the issue briefly.
   - Ask the user whether to investigate, plan, or start implementing, unless they already indicated the next step.

## Quality criteria

- The correct issue is read by number or URL.
- Title, state, body, and key comments are included in the agent context.
- The user is asked for the next step only if it is not already clear.
- If `tea` is not installed or the issue is not found, report the exact error and suggest checking the issue number or Gitea authentication.
