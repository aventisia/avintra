---
name: commit
description: "Format changed files (where Prettier is available), analyze the changes, and create a single weighted commit. Use when preparing a commit."
argument-hint: "Any specific focus for the commit message, or proceed with auto-analysis?"
user-invocable: true
---

# Commit

Format, analyze, and commit the current working-tree changes in one pass. 

## When to Use

- You have local uncommitted changes and want them formatted and committed.
- You want a single, short, precisely worded commit message describing the changes.

## Procedure

### 1. Get changed files

Run these in parallel to capture the full change set:

```sh
git status
git diff --name-only
git diff --cached --name-only
```

- If there are no changes at all, stop and report that — do not create an empty commit.
- Note which files are staged vs. unstaged vs. untracked; all of them are in scope for this commit.

### 2. Format changed files

For each changed file that belongs to a Prettier-enabled project, run `npx --no-install prettier --write` from the directory containing the nearest `.prettierrc*` config file. This respects project-level Prettier config and avoids downloading Prettier when it is not installed.

A safe cross-project approach from the repo root:

```sh
for file in $(git diff --name-only; git diff --cached --name-only; git ls-files --others --exclude-standard); do
  # Only consider files Prettier typically understands.
  case "$file" in
    *.js|*.jsx|*.ts|*.tsx|*.mjs|*.cjs|*.json|*.css|*.scss|*.md|*.mdx|*.html|*.yaml|*.yml)
      dir=$(dirname "$file")
      root=""
      while [ "$dir" != "." ] && [ "$dir" != "/" ]; do
        if ls "$dir"/.prettierrc* 1>/dev/null 2>&1; then
          root=$dir
          break
        fi
        # Stop at package.json boundaries that lack a prettier config.
        if [ -f "$dir/package.json" ]; then
          break
        fi
        dir=$(dirname "$dir")
      done
      if [ -n "$root" ]; then
        (cd "$root" && npx --no-install prettier --write "${file#$root/}")
      fi
      ;;
  esac
done
```

- Files outside Prettier-enabled projects (e.g. .NET, Python) are left untouched.
- After formatting, re-check `git status`; formatting may introduce additional modifications that should be included in the commit.

### 3. Analyze changes

Review all modified files (including formatting-only edits) with `git diff` / `git diff --cached`. Group them logically:

- **Main Change**: the core feature, bug fix, or domain where the majority of changes reside.
- **Unrelated Changes**: isolated modifications, distinct bug fixes, or minor tweaks in other domains.

Use the optional user argument to focus the analysis when provided.

### 4. Determine the issue reference

Scan the full session context for an issue reference and record it when present:

- The session text (user messages, plan, task description, TODOs).
- The session title/name.

Recognize references such as `#123`, `issue 123`, `Issue #123`, bracketed titles like `[#123]`, and full issue URLs (e.g. Gitea/GitHub `.../issues/123`). Use the numeric issue number.

- If an issue number is found, append ` #<issue>` to the end of the commit subject line.
- If multiple issues are found, include each, separated by commas: ` #123, #124`.
- If no issue reference is found anywhere, omit it — do not invent one.

### 5. Commit

Stage all changed files and create a single commit for them using the format below.

```sh
git add -A
git commit -m "<type>(<main-scope>): <short description of the Main Change> #<issue>

Other changes:
- <short description of other change 1>
- <short description of other change 2>"
```

Omit the `Other changes:` section if all changes belong to the Main Change.
Omit the trailing ` #<issue>` if no issue reference was found in step 4.

- **Do not** add any model attribution to the commit footer — no `Co-Authored-By`, `Generated with`, or similar trailer.
- After committing, run `git status` to verify the commit succeeded and the tree is clean.

## Commit Message Format

```
<type>(<main-scope>): <short description of the Main Change> #<issue>

Other changes:
- <short description of other change 1>
- <short description of other change 2>"
```

### Commit Rules

- **Format Before Analyzing**: Formatting runs first so formatting-only churn is visible and included in the analysis.
- **Single Commit**: All changes, regardless of domain, are grouped into exactly one commit.
- **Git Command Failure Policy**: If any git command fails for any reason, stop immediately and do not proceed to the next steps.
- **Weighted Messaging**: The commit subject line and primary body must only reference the Main Change.
- **Issue Reference**: If an issue number is mentioned anywhere in the session text or the session title/name, append ` #<issue>` to the commit subject line (comma-separated for multiple). Never fabricate an issue number.
- **Conditional Footer**: Append the `Other changes:` footer only if distinct, unrelated changes are present. If all files belong to the Main Change, omit the footer entirely.
- **No Model Attribution**: Never append `Co-Authored-By`, "Generated with Codex", or any other model attribution to the commit message.
- **Automated Execution**: Execute standard git and npx commands autonomously. Pause for user input only if something looks unsafe (e.g. a staged file that may contain secrets).