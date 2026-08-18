---
name: commit
description: "Stash local changes, pull remote updates, pop the stash, resolve any merge conflicts, format changed files, and generate a weighted, unified commit message. Use when you want to sync the current branch before committing, or when preparing a clean commit after pulling upstream changes."
argument-hint: "Any specific focus for the commit message, or proceed with auto-analysis?"
user-invocable: true
---

# Commit

Execute a safe pull operation followed by a consolidated commit. The commit message prioritizes the primary feature, bug fix, or domain where most changes reside, while relegating unrelated file changes to the footer.

## When to Use

- You have local uncommitted changes and want to pull the latest remote commits first.
- You need a single, logically weighted commit message after syncing.
- You want to avoid forgetting to stash before pulling and then resolving conflicts cleanly.

## Procedure

Run the commands below directly in the terminal. All paths and tools are assumed to be available in the current shell (`git`, `npx`).

### 1. Stash local changes

Stash **all** current uncommitted changes — tracked, modified, and untracked files — before pulling.

```sh
git stash push -u -m "commit auto-stash"
```

- Do not skip this step if `git status` shows any local changes.
- If there are no changes, `git stash` will report "No local changes to save"; that is safe to ignore.

### 2. Pull remote updates

```sh
git pull
```

- If the pull reports "Already up to date", proceed to the next step.

### 3. Pop the stash

```sh
git stash pop
```

- If `git stash pop` reports conflicts, proceed to the conflict gate below.

### 4. Resolve conflicts (gate)

Check for unresolved merge conflicts.

```sh
git diff --name-only --diff-filter=U
```

- If the list is non-empty, resolve conflicts based on the current project context.
- If domain knowledge is required to resolve safely, ask the user before choosing a resolution.
- Do **not** proceed until `git status` shows all conflicts resolved and files staged.

### 5. Format changed files

For each changed file that belongs to a Prettier-enabled project, run `npx --no-install prettier --write` from the directory containing the nearest `.prettierrc*` config file. This respects project-level Prettier config and avoids downloading Prettier when it is not installed.

A safe cross-project approach from the repo root:

```sh
for file in $(git diff --name-only; git diff --cached --name-only); do
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

On Windows (PowerShell), use the equivalent loop or run the Bash variant under WSL/Git Bash.

After formatting, re-check `git status`; formatting may introduce additional modifications that should be committed.

### 6. Analyze changes

Review all modified files. Group them logically:

- **Main Change**: the core feature, bug fix, or domain where the majority of changes reside.
- **Unrelated Changes**: isolated modifications, distinct bug fixes, or minor tweaks in other domains.

Use the optional user argument to focus the analysis when provided.

### 7. Commit

Generate and execute a single commit for all changed files using the format below.

```sh
git add -A
git commit -m "<type>(<main-scope>): <short description of the Main Change>

<Detailed description of the Main Change, explaining why the primary changes were made and their impact.>

Other unrelated changes:
- <description of other unrelated change 1>
- <description of other unrelated change 2>"
```

Omit the `Unrelated:` section if all changes belong to the Main Change.

## Commit Message Format

```
<type>(<main-scope>): <short description of the Main Change>

<Detailed description of the Main Change, explaining why the primary changes were made and their impact.>

Other unrelated changes:
- <description of other unrelated change 1>
- <description of other unrelated change 2>"
```

### Commit Rules

- **Strict Stash/Pull/Pop Sequence**: Never skip the stash step if there are modified tracked files.
- **Conflict Gate**: Halt and ensure clean resolution before analyzing files for the commit message.
- **Single Commit**: All changes, regardless of domain, must be grouped into exactly one commit.
- **Weighted Messaging**: The commit subject line and primary body must only reference the Main Change.
- **Conditional Footer**: Append the `Unrelated:` footer only if distinct, unrelated changes are present. If all files belong to the Main Change, omit the footer entirely.
- **Automated Execution**: Execute standard git and npx commands autonomously. Pause for user input only if a conflict requires human domain knowledge to resolve safely.
