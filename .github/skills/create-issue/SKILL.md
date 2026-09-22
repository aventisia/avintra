---
name: create-issue
disable-model-invocation: true
argument-hint: "Title, body, optional label(s), and optional assignee(s) for the new Gitea issue"
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
- One or more approved label(s) to assign to the issue, provided as a comma-separated list.
- Optional assignee(s), provided as a comma-separated list of Gitea usernames.
- If the user supplied a file path, use the file contents as the body rather than summarizing it.

### Approved Labels

Only use labels from this repository label catalog. Preserve the exact spelling and capitalization.

| Label                   | Meaning                                              |
| ----------------------- | ---------------------------------------------------- |
| `Compat/Breaking`       | Breaking change that will not be backward compatible |
| `Kind/Bug`              | Something is not working                             |
| `Kind/Documentation`    | Documentation changes                                |
| `Kind/Enhancement`      | Improve existing functionality                       |
| `Kind/Feature`          | New functionality                                    |
| `Kind/Security`         | Security issue                                       |
| `Kind/Testing`          | Issue or pull request related to testing             |
| `Priority/Critical`     | Critical priority                                    |
| `Priority/High`         | High priority                                        |
| `Priority/Medium`       | Medium priority                                      |
| `Priority/Low`          | Low priority                                         |
| `Reviewed/Confirmed`    | Issue has been confirmed                             |
| `Reviewed/Duplicate`    | Issue already exists                                 |
| `Reviewed/Invalid`      | Invalid issue                                        |
| `Reviewed/Won't Fix`    | Issue will not be fixed                              |
| `Status/Abandoned`      | Work was started but abandoned                       |
| `Status/Blocked`        | Something is blocking the issue or pull request      |
| `Status/Need More Info` | More information is required to continue             |
| `bug`                   | Something is not working                             |
| `duplicate`             | Issue already exists                                 |
| `enhancement`           | New feature or improvement                           |
| `help wanted`           | Help is needed                                       |
| `invalid`               | Something is wrong                                   |
| `new feature`           | New feature or enhancement request                   |
| `question`              | More information is needed                           |
| `wontfix`               | This will not be fixed                               |

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

4. **Select labels.**
   - If the user explicitly provided one or more labels, use those labels exactly and do not replace them with inferred labels.
   - If the user did not provide labels, identify one or more matching labels from the approved catalog based on the issue title and body. Prefer the most specific `Kind/*` label and add a `Priority/*` label only when the priority is clear from the issue. Add `Compat/*`, `Status/*`, or `Reviewed/*` only when the issue clearly meets that label's meaning.
   - Do not invent labels or silently substitute unapproved names. If an explicitly supplied label is not in the catalog, ask the user to choose an approved label before creating the issue.
   - Pass selected labels as a comma-separated list to `tea`; at least one label is required.

5. **Collect assignees.**
   - If the user explicitly provided one or more assignees, preserve them as a comma-separated list of Gitea usernames.
   - If no assignees were provided, do not infer or invent assignees and omit the `--assignees` option.

6. **Create the issue.**

   ```bash
   tea issue create --title "$TITLE" --description "$BODY" --labels "$LABELS" --assignees "$ASSIGNEES"
   ```

   Include `--assignees "$ASSIGNEES"` only when one or more assignees were provided. Otherwise use:

   ```bash
   tea issue create --title "$TITLE" --description "$BODY" --labels "$LABELS"
   ```

   For multi-line bodies with quotes, prefer writing the body to a temporary file and passing it safely:

   ```bash
   tea issue create --title "$TITLE" --description "$(cat /tmp/issue-body.md)" --labels "$LABELS" --assignees "$ASSIGNEES"
   ```

7. **Report the result.**
   - Share the issue number and URL returned by `tea`.
   - If `tea` is not installed, report the exact command the user can run manually and offer to write the issue body to a file.

## Quality criteria

- Title is non-empty, descriptive, and action-oriented.
- Body reflects the agreed plan or investigation outcome, not a generic summary.
- At least one approved label is selected and assigned using Tea's comma-separated `--labels` option.
- Explicitly provided assignees are assigned using Tea's comma-separated `--assignees` option.
- The issue URL or manual fallback is reported back to the user.
- No extra fields (assignees, milestones) are invented unless the user explicitly asks for them.
