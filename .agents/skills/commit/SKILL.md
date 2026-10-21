---
name: commit
description: "Format and commit only the user-authorized change set after excluding unrelated work and reviewing the exact staged paths."
argument-hint: "Any specific focus for the commit message, or proceed with auto-analysis?"
user-invocable: true
---

# Commit

Format, analyze, and create one commit from the user-authorized change set. Never assume every working-tree change belongs to the requested commit.

This is a standalone, user-invoked lifecycle operation outside the coding loop, not a coder dependency. Require suitable permissions for Git mutations and formatting; QA success alone does not authorize either.

## When to Use

- The user explicitly asks to commit a known change set.
- You want a single, short, precisely worded commit message describing the changes.

## Procedure

### 1. Get changed files

Run these in parallel to inventory the worktree:

```sh
git status
git diff --name-only
git diff --cached --name-only
```

- If there are no changes at all, stop and report that — do not create an empty commit.
- Record which files are staged, unstaged, and untracked. Treat files as in scope only when they belong to the requested work and the user has authorized them for this commit.
- If unrelated or ambiguous changes exist, stop and ask which exact paths to include. Do not format, stage, or commit them.

### 2. Format changed files

For each confirmed in-scope file in a Prettier-enabled project, run `npx --no-install prettier --write` from the directory containing its nearest `.prettierrc*` config. Never use a loop over all Git changes unless the user explicitly authorized every listed path.

- Files outside Prettier-enabled projects (e.g. .NET, Python) are left untouched.
- Inspect formatter configuration/plugins and side effects first. If the command is denied, request a narrow configuration change; do not route it through coder or claim saved approval overrides denial.
- After formatting, re-check `git status`; formatting may introduce additional modifications that should be included in the commit.

### 3. Analyze changes

Review all authorized files (including formatting-only edits) with `git diff` / `git diff --cached`. Group them logically:

- **Main Change**: the core feature, bug fix, or domain where the majority of changes reside.
- **Other Authorized Changes**: distinct but in-scope modifications in other domains.

Use the optional user argument to focus the analysis when provided.

### 4. Determine the issue reference

Use only the active work-item issue reference supplied in the current request or orchestrator handoff:

- Recognize `#123`, `issue 123`, `Issue #123`, bracketed titles like `[#123]`, and full issue URLs. Use the numeric issue number only when it belongs to the current work item.

- If an issue number is found, append ` #<issue>` to the end of the commit subject line.
- If multiple issues are found, include each, separated by commas: ` #123, #124`.
- If the active work item has no issue reference, omit it — do not infer one from unrelated session history.

### 5. Commit

Stage only the confirmed in-scope paths and create one commit for them using the format below. Obtain explicit user confirmation if the exact paths have not already been authorized.

```sh
git add -- <confirmed-path-1> <confirmed-path-2>
git commit -m "<type>(<main-scope>): <short description of the Main Change> #<issue>

Other changes:
- <short description of other change 1>
- <short description of other change 2>"
```

Omit the `Other changes:` section if all changes belong to the Main Change.
Omit the trailing ` #<issue>` if no issue reference was found in step 4.

- **Do not** add any model attribution to the commit footer — no `Co-Authored-By`, `Generated with`, or similar trailer.
- After committing, run `git status` to verify the commit succeeded. Report any unrelated files that remain; do not stage or clean them.

## Commit Message Format

```
<type>(<main-scope>): <short description of the Main Change> #<issue>

Other changes:
- <short description of other change 1>
- <short description of other change 2>"
```

### Commit Rules

- **Format Before Analyzing**: Formatting runs first so formatting-only churn is visible and included in the analysis.
- **Single Commit**: All authorized in-scope changes are grouped into exactly one commit. Keep unrelated work out of it.
- **Git Command Failure Policy**: If any git command fails for any reason, stop immediately and do not proceed to the next steps.
- **Weighted Messaging**: The commit subject line and primary body must only reference the Main Change.
- **Issue Reference**: Append an issue number only when it is explicitly tied to the active work item. Never infer it from unrelated conversation history or fabricate one.
- **Conditional Footer**: Append the `Other changes:` footer only for distinct, authorized in-scope changes. Never use it to include unrelated work.
- **No Model Attribution**: Never append `Co-Authored-By`, "Generated with Codex", or any other model attribution to the commit message.
- **Authorized Execution**: Run only the confirmed change set and permitted commands; pause for missing authorization, ambiguous staged work, denied commands, or unsafe content.
