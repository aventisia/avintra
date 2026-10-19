---
name: close-issue
disable-model-invocation: true
argument-hint: "Issue number or URL, and optional closing comment"
description: "Close a Gitea issue, posting the user's closing comment first when one is given."
---

# Close Gitea Issue

Close an existing Gitea issue, with an optional closing comment recorded first.

Read [`../GITEA.md`](../GITEA.md) first. It governs authorization, target resolution, request scoping, safe text passing, and outcome reporting for every step below.

## Steps

1. **Resolve the issue** per `GITEA.md`.

2. **Post the comment, when the user supplied one**, verbatim. With no comment supplied, go straight to step 3. The comment comes only from the user, never drafted or requested.

   ```bash
   tea comments add --repo "$REPO" "$ISSUE_ID" "$COMMENT"
   ```

   If posting fails, stop. The issue stays open until its requested comment is recorded.

3. **Close the issue.**

   ```bash
   tea issues close --repo "$REPO" "$ISSUE_ID"
   ```

4. **Report** per `GITEA.md`: closed or not, and whether the comment was posted first. If closing fails after the comment succeeded, say the comment is posted and the issue is still open.
