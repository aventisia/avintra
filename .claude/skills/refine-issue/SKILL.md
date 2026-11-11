---
name: refine-issue
disable-model-invocation: true
argument-hint: "Issue number or URL, and optional related issues"
description: "Turn a GitHub issue into an approved brief: investigate the code, agree the brief with the user, and write it into the issue description."
---

# Refine GitHub Issue

Turn a thin issue into an approved brief that implementation can start from.

Read [`../GITHUB.md`](../GITHUB.md) and [`../BRIEF.md`](../BRIEF.md) first. `GITHUB.md` governs authorization, target resolution, request scoping, and outcome reporting; `BRIEF.md` governs related issues, the investigation, the brief, its approval, and what follows posting.

## Steps

1. **Resolve the issue** per `GITHUB.md`. When the user names several, the first is the issue to refine and the rest are related issues for `BRIEF.md`.

2. **Fetch** the issue and its comments:

   ```bash
   gh api "repos/$REPO/issues/$ID"
   gh api "repos/$REPO/issues/$ID/comments" --paginate
   ```

   Keep the body, labels, state, and `updated_at` as fetched. The body is the original report; when it already holds a brief from an earlier refine, its Original report section is the original report and the rest is your starting draft. Warn and continue when the issue is closed. On a tool error, report it and stop rather than reconstructing issue contents.

3. **Brief.** Find related issues, investigate, draft, and review per `BRIEF.md` until the user approves a revision. The comments are requirements alongside the body.

4. **Check for concurrent edits.** Re-fetch the issue. When its `updated_at` differs from step 2, re-fetch the comments too, show the user what changed in the body or comments, and fold it into a new revision for approval.

5. **Post** the approved file as the description. The title stays as it is. Add `--remove-labels "Status/Need More Info"` when the issue carries that label.

   ```bash
   BODY=$(cat "local-issues/<key>/brief.md")
   gh issue edit --repo "$REPO" "$ID" --body "$BODY" --add-label "Reviewed/Confirmed"
   ```

   Then record the approval and close the Combine issues per Post in `BRIEF.md`.

6. **Report** per `GITHUB.md`: each issue's URL and what was posted to it or done to it. When the description edit succeeded and a later step failed, say which parts landed.
