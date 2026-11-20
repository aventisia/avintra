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

   Keep the title, body, labels, state, and `updated_at` as fetched. The body is the original report; when it already holds a brief from an earlier refine, its Original report section is the original report and the rest is your starting draft. Warn and continue when the issue is closed. On a tool error, report it and stop rather than reconstructing issue contents.

3. **Brief.** Find related issues, investigate, draft, and review per `BRIEF.md` until the user approves a revision. The comments are requirements alongside the body. Show beside every revision the title, the labels as step 5 will leave them, and the project the `Kind/*` label names (per `GITHUB.md` → Projects); the approval covers them. The title and kind stay as fetched unless the brief shows the issue is another kind, or it carries no `Kind/*` label or several. Then propose the one kind that fits and a title for it in the `create-issue` format (`[Type] Actionable and specific summary`).

4. **Check for concurrent edits.** Re-fetch the issue. When its `updated_at` differs from step 2, re-fetch the comments too, show the user what changed in the body or comments, and fold it into a new revision for approval.

5. **Post** the approved file as the description, with the approved title and kind:

   ```bash
   BODY=$(cat "local-issues/<key>/brief.md")
   gh issue edit --repo "$REPO" "$ID" --body "$BODY" --add-label "Reviewed/Confirmed"
   ```

   Add these flags when they apply:
   - The issue carries `Status/Need More Info` → `--remove-label "Status/Need More Info"`.
   - A fetched `Kind/*` label other than the approved kind → `--remove-label "<that Kind/*>"` for each one.
   - The approved kind is not among the fetched labels → `--add-label "<approved Kind/*>"`.
   - The approved title differs from the fetched one → `--title "$TITLE"`. Dropping extra `Kind/*` labels while keeping a fetched one leaves the title as fetched.

   Then record the approval and close the Combine issues per Post in `BRIEF.md`, and place the issue per `GITHUB.md` → Projects, which also takes it off the wrong project.

6. **Report** per `GITHUB.md`: each issue's URL, what was posted to it or done to it, and its project placement as `GITHUB.md` → Projects reports it. When the description edit succeeded and a later step failed, say which parts landed.
