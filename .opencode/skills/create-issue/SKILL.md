---
name: create-issue
disable-model-invocation: true
argument-hint: "Title, body, optional label(s), optional assignee(s), and optional repo for the new Gitea issue"
description: "Create a Gitea issue to track an investigation outcome, agreed plan, or implementation task. Use after the agent and user have reached a mutual understanding and want to preserve the decision before coding starts."
---

# Create Gitea Issue

Persist a decided plan or investigation outcome as a Gitea issue before implementation begins.

This is a standalone, user-invoked lifecycle operation outside the coding loop. Require suitable permissions and explicit mutation authorization; planning or QA completion does not authorize publication.

## When to Use

- The user and agent have finished investigating or planning and reached a shared understanding.
- The user says something like "create an issue for this", "track this in Gitea", "let's open a ticket before we start", or "file this plan".
- The goal is to capture the agreed plan, problem statement, and next steps so implementation can be tracked and reviewed later.

## Prerequisites

Before collecting any content, confirm the environment is ready:

1. **Check `tea` is installed and authenticated.** Run `tea --version` and `tea whoami` for the default login. For a non-default host/login, use `tea login list` and verify the selected login with the read-only request `tea api --login "$LOGIN" /user`. If `tea` is missing or unauthenticated, stop early rather than composing the issue body.
2. **Determine the target repository.**
   - If the user named a repo (e.g. `owner/repo`), use it explicitly with `--repo`. If they supplied a repository URL, preserve its host and use its configured login.
   - If the command is run from inside a git working directory that has a Gitea remote, confirm that remote is the intended repository; use `--repo .` for that checkout.
   - If neither applies, ask the user which repository the issue belongs to before proceeding.

## What the Issue Should Contain

- A title that follows the required format: `[Type] Actionable and specific summary`.
- A body that captures the current problem or need and the intended solution state.
- One or more approved labels from the repository catalog.
- Optional assignee(s), provided as a comma-separated list of Gitea usernames.
- If the user supplied a file path, use the file contents as the body rather than summarizing it.

### Title Format

Use this exact pattern for the issue title:

`[Type] Actionable and specific summary`

Examples:

- `[Bug] React Flow nodes fail to render on initial load`
- `[Feature] Implement dynamic expression evaluation for reporting`

Choose the `Type` from the issue category, such as `Bug`, `Feature`, `Enhancement`, `Documentation`, `Security`, or `Testing`.

If the user's provided title already matches this format (including the brackets), use it as-is — do not double-bracket or reformat a title that's already correct.

### Description Format for issues without a detailed plan

When the issue does not yet have a detailed plan, use this format:

```md
### Context

<!-- Why this issue exists: The current broken behavior (for bugs) or the underlying need (for features/enhancements). -->

### Expected Behavior / Solution

<!-- The agreed-upon fix or implementation. What does the final state look like? -->
```

If a detailed plan already exists, use that plan directly and preserve Markdown formatting.

### Approved Labels

Only use labels from this repository label catalog. Preserve the exact spelling and capitalization.

| Label                   | Meaning                                              |
| ----------------------- | ----------------------------------------------------- |
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

## Procedure

1. **Confirm the intent.**
   - If a plan or investigation result is already in the conversation, proceed.
   - If the context is unclear, ask the user what should go into the issue before creating it.

2. **Collect the title.**
   - Use the title the user provided.
   - If none was provided, ask for one.
   - Enforce the required format: `[Type] Actionable and specific summary`.
   - Keep it concise, specific, and under 120 characters when possible.

3. **Collect the body.**
   - If the user provided a file path, read it and use the contents as the body.
   - If the user provided inline text, use it directly.
   - If neither was provided but a plan exists in the conversation, compose the body from the agreed plan and ask the user to confirm or edit before publishing.
   - If no detailed plan exists yet, use the default template:

     ```md
     ### Context

     <!-- Why this issue exists: The current broken behavior (for bugs) or the underlying need (for features/enhancements). -->

     ### Expected Behavior / Solution

     <!-- The agreed-upon fix or implementation. What does the final state look like? -->
     ```

   - Preserve Markdown formatting.

4. **Select labels.**
   - If the user explicitly provided one or more labels, use those labels exactly and do not replace them with inferred labels.
   - If the user did not provide labels, identify one or more matching labels from the approved catalog based on the issue title and body, preferring namespaced labels per the note above.
   - Prefer the most specific `Kind/*` label. Do not add a `Priority/*` label automatically; priority is manually decided later in the Gitea UI by the user.
   - Add `Compat/*`, `Status/*`, or `Reviewed/*` only when the issue clearly meets that label's meaning.
   - Do not invent labels or silently substitute unapproved names. If an explicitly supplied label is not in the catalog, ask the user to choose an approved label before creating the issue.
   - Pass selected labels as a comma-separated list to `tea`; at least one label is required.

5. **Collect assignees.**
   - If the user explicitly provided one or more assignees, preserve them as a comma-separated list of Gitea usernames.
   - If no assignees were provided, do not infer or invent assignees and omit the `--assignees` option.

6. **Confirm before submitting.**
   - Show the user the assembled title, body, labels, repo, and assignees (if any) in one block.
   - This confirmation is required whenever the body was auto-composed from conversation context or labels were inferred rather than explicitly given. It can be skipped only when the user supplied title, body, and labels verbatim and simply asked you to file them as-is.

7. **Create the issue.**

    Create the issue using the resolved repository and a safely quoted `--description "$BODY"` argument. Add `--login "$LOGIN"` only for a non-default login, and `--assignees` only when assignees were provided:

   ```bash
    tea issues create \
      --repo "$REPO" \
      --title "$TITLE" \
      --description "$BODY" \
      --labels "$LABELS" \
      --assignees "$ASSIGNEES"
   ```

    Pass `--repo "$REPO"` for the confirmed target and `--login "$LOGIN"` only for a non-default login. Omit `--assignees` if none were given.

8. **Report the result.**
   - Share the issue number and URL returned by `tea`.
   - If `tea` is not installed or the create command fails, report the exact command the user can run manually and offer to write the issue body to a file for them.

## Quality criteria

- Title is non-empty, descriptive, action-oriented, and follows `[Type] Summary` without double-formatting an already-correct title.
- Target repository is explicit or confirmed, not assumed silently.
- Body reflects the agreed plan or investigation outcome, not a generic summary.
- At least one approved label is selected and assigned using Tea's comma-separated `--labels` option, preferring namespaced labels over flat legacy duplicates when inferred.
- Explicitly provided assignees are assigned using Tea's comma-separated `--assignees` option.
- Auto-composed bodies or inferred labels are shown to the user for confirmation before the issue is created.
- The issue URL or manual fallback is reported back to the user.
- No extra fields (assignees, milestones, priority) are invented unless the user explicitly asks for them.
