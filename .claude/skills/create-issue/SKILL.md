---
name: create-issue
disable-model-invocation: true
argument-hint: "Title, body or file path, and optional labels, assignees, and repo"
description: "File a Gitea issue that preserves an agreed plan or investigation outcome before implementation starts."
---

# Create Gitea Issue

Persist an agreed plan or investigation outcome as a Gitea issue so implementation can be tracked and reviewed.

Read [`../GITEA.md`](../GITEA.md) first. It governs authorization, repository resolution, request scoping, safe text passing, and outcome reporting for every step below.

## Steps

1. **Resolve the repository** per `GITEA.md`: a named `owner/repo` or repository URL, else the current checkout once confirmed as intended; otherwise ask. Verify `tea` before composing anything.

2. **Settle the title.** Use the user's title, or ask for one. Format: `[Type] Actionable and specific summary`, under about 120 characters, with `Type` from the label table below (`[Bug] React Flow nodes fail to render on initial load`). A title already in this format is used as-is.

3. **Settle the body**, first match wins:
   - A file path → the file's contents, verbatim.
   - Inline text → that text, verbatim.
   - An agreed plan or investigation in the conversation → a body composed from it, preserving its Markdown.
   - A clear need with no detailed plan yet → this template, filled in:

     ```md
     ### Context

     <!-- Why this issue exists: the current broken behavior (bugs) or the underlying need (features/enhancements). -->

     ### Expected Behavior / Solution

     <!-- The agreed fix or implementation. What does the final state look like? -->
     ```

   - Nothing clear enough to file → ask the user what the issue should capture.

4. **Select labels** from the catalog below, spelled exactly. At least one label is required.
   - User-supplied labels are used exactly as given. One missing from the catalog → ask the user to pick an approved label.
   - Otherwise infer: the `Kind/*` label matching the title type, plus `Compat/*`, `Status/*`, or `Reviewed/*` only when the issue clearly meets that label's meaning. `Priority/*` stays off; the user sets priority later in the Gitea UI.

5. **Collect assignees**: only usernames the user gave, as a comma-separated list. Milestones, priority, and other fields stay unset unless asked for.

6. **Confirm.** Show repo, title, body, labels, and assignees in one block and wait for explicit approval. Skip this only when the user supplied title, body, and labels verbatim and asked to file them as-is.

7. **Create the issue.** Drop the `--assignees` line when there are none.

   ```bash
   tea issues create \
     --repo "$REPO" \
     --title "$TITLE" \
     --description "$BODY" \
     --labels "$LABELS" \
     --assignees "$ASSIGNEES"
   ```

8. **Report** per `GITEA.md`, with the issue number and URL.

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
