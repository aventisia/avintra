---
name: create-issue
disable-model-invocation: true
argument-hint: "Problem or feedback to brief, or a body/file to file verbatim; optional title, labels, assignees, and repo"
description: "File a GitHub issue as an approved brief, or with a body the user supplies verbatim."
---

# Create GitHub Issue

File new work as an approved brief, so the issue is ready for implementation the moment it exists.

Read [`../GITHUB.md`](../GITHUB.md) first. It governs authorization, repository resolution, request scoping, safe text passing, and outcome reporting for every step below. [`../BRIEF.md`](../BRIEF.md) governs related issues, the brief, and what follows posting.

## Steps

1. **Resolve the repository** per `GITHUB.md`: a named `owner/repo` or repository URL, else the current checkout once confirmed as intended; otherwise ask. Verify `gh` before composing anything.

2. **Search for related issues** per `BRIEF.md` before any investigation or brief. Show the user every match with its state and one line on how it overlaps, and let them choose: file a new issue, or add the problem to an existing one. Only a choice to file continues; otherwise stop and suggest `/refine-issue <n>` to re-brief that issue or `/add-comment <n>` to note the problem on it. A brief carries the matches into its Related issues section. With no matches, say which terms you searched and continue.

3. **Settle the body**, first match wins:
   - A file path, or text the user asks to file as the body as-is → that content, verbatim.
   - Feedback, a problem statement, or an agreed plan or investigation in the conversation → a brief: investigate and draft per `BRIEF.md`. Feedback someone else wrote goes verbatim into Original report; drop that section when the brief comes from the conversation alone.
   - Nothing clear enough to file → ask the user what the issue should capture.

4. **Settle the title.** Use the user's title; otherwise propose one from the brief, or ask for one for a verbatim body. Format: `[Type] Actionable and specific summary`, under about 120 characters, with `Type` from the label table below (`[Bug] React Flow nodes fail to render on initial load`). A title already in this format is used as-is.

5. **Select labels** from the catalog below, spelled exactly. At least one label is required.
   - User-supplied labels are used exactly as given. One missing from the catalog → ask the user to pick an approved label.
   - Otherwise infer: the `Kind/*` label matching the title type, plus `Compat/*`, `Status/*`, or `Reviewed/*` only when the issue clearly meets that label's meaning. A brief always adds `Reviewed/Confirmed`. `Priority/*` stays off; the user sets priority later in the GitHub UI.

6. **Collect assignees**: only usernames the user gave, as a comma-separated list. Milestones, priority, and other fields stay unset unless asked for.

7. **Confirm.** For a brief, run the review in `BRIEF.md` with repo, title, labels, and assignees shown beside every revision; its approval covers them all. Otherwise show repo, title, body, labels, and assignees in one block and wait for explicit approval. Skip this only when the user supplied title, body, and labels verbatim and asked to file them as-is.

8. **Create the issue.** For a brief, fill `BODY` from the approved file: `BODY=$(cat "local-issues/<key>/brief.md")`. Drop the `--assignees` line when there are none.

   ```bash
   gh issue create \
     --repo "$REPO" \
     --title "$TITLE" \
     --body "$BODY" \
     --label "$LABELS" \
     --assignee "$ASSIGNEES"
   ```

   For a brief, then record the approval and close the Combine issues per Post in `BRIEF.md`.

9. **Report** per `GITHUB.md`, with the issue number and URL, and each Combine issue closed.

## Label Catalog

| Label                   | Title `[Type]`  | Meaning                                              |
| ----------------------- | --------------- | ---------------------------------------------------- |
| `Kind/Bug`              | `Bug`           | Something is not working                             |
| `Kind/Feature`          | `Feature`       | New functionality                                    |
| `Kind/Enhancement`      | `Enhancement`   | Improve existing functionality                       |
| `Kind/Documentation`    | `Documentation` | Documentation changes                                |
| `Kind/Security`         | `Security`      | Security issue                                       |
| `Kind/Testing`          | `Testing`       | Issue or pull request related to testing             |
| `Compat/Breaking`       |                 | Breaking change that will not be backward compatible |
| `Priority/Critical`     |                 | Critical priority                                    |
| `Priority/High`         |                 | High priority                                        |
| `Priority/Medium`       |                 | Medium priority                                      |
| `Priority/Low`          |                 | Low priority                                         |
| `Reviewed/Confirmed`    |                 | Issue has been confirmed                             |
| `Reviewed/Duplicate`    |                 | Issue already exists                                 |
| `Reviewed/Invalid`      |                 | Invalid issue                                        |
| `Reviewed/Won't Fix`    |                 | Issue will not be fixed                              |
| `Status/Abandoned`      |                 | Work was started but abandoned                       |
| `Status/Blocked`        |                 | Something is blocking the issue or pull request      |
| `Status/Need More Info` |                 | More information is required to continue             |
