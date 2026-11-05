---
name: close-issue
disable-model-invocation: true
argument-hint: "Issue number or URL, and optional closing comment"
description: "Close a GitHub issue, posting the user's closing comment first when one is given."
---

# Close GitHub Issue

Close an existing GitHub issue, with an optional closing comment recorded first.

Read [`../GITHUB.md`](../GITHUB.md) first. It governs authorization, target resolution, request scoping, safe text passing, and outcome reporting for every step below.

## Steps

1. **Resolve the issue** per `GITHUB.md`.

2. **Post the comment, when the user supplied one**, verbatim. With no comment supplied, go straight to step 3. The comment comes only from the user, never drafted or requested.

   ```bash
   gh issue comment --repo "$REPO" "$ISSUE_ID" --body "$COMMENT"
   ```

   If posting fails, stop. The issue stays open until its requested comment is recorded.

3. **Close the issue.**

   ```bash
   gh issue close --repo "$REPO" "$ISSUE_ID"
   ```

4. **Report** per `GITHUB.md`: closed or not, and whether the comment was posted first. If closing fails after the comment succeeded, say the comment is posted and the issue is still open.
