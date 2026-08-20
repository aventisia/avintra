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

### 1. Scan for secrets (gate)

Before anything is stashed, staged, or committed, scan **all** uncommitted changes (tracked + untracked) for hardcoded secrets: JWTs, API keys, bearer tokens, connection strings, private keys, and similar credentials.

Run Gitleaks against the full working tree (unstaged + staged + untracked):

**Bash / WSL / Git Bash**

```sh
# Scan the current diff (unstaged + staged) for secrets.
git diff --no-color | gitleaks detect --no-git -v || true
# Also scan untracked files that are about to enter the repo.
untracked=$(git ls-files --others --exclude-standard)
if [ -n "$untracked" ]; then
  echo "$untracked" | tr '\n' '\0' | xargs -0 cat 2>/dev/null | gitleaks detect --no-git -v || true
fi
```

**PowerShell (Windows)**

```powershell
# Scan the current diff (unstaged + staged) for secrets.
git diff --no-color | gitleaks detect --no-git -v
$untracked = git ls-files --others --exclude-standard
if ($untracked) {
    $untracked | ForEach-Object { Get-Content -Raw $_ } | Out-String | gitleaks detect --no-git -v
}
```

- If Gitleaks is not installed, fall back to a **regex-based grep scan** that catches common secret patterns before the commit proceeds:

**Bash / WSL / Git Bash**

```sh
# Regex fallback: JWTs, generic API keys/tokens, private keys, connection strings.
# Only scans added/modified lines so removed-secret cleanups don't trigger.
git diff --no-color --diff-filter=AM --unified=0 | grep -nE "^\+" | grep -iE "(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})|((api[_-]?key|secret|token|bearer|password|passwd|pwd|private[_-]?key|client[_-]?secret|access[_-]?token|connection[_-]?string|connstring)\s*[:=]\s*[\"'\\`][^\"'\\`]{8,})|BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY" || true
```

**PowerShell (Windows)**

```powershell
# Regex fallback: JWTs, generic API keys/tokens, private keys, connection strings.
# Only scans added/modified lines so removed-secret cleanups don't trigger.
$diff = git diff --no-color --diff-filter=AM --unified=0
$added = $diff | Where-Object { $_ -match '^\+' -and $_ -notmatch '^\+\+\+' }
$pattern = '(eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,})|((?i)(api[_-]?key|secret|token|bearer|password|passwd|pwd|private[_-]?key|client[_-]?secret|access[_-]?token|connection[_-]?string|connstring)\s*[:=]\s*["' + "`" + "'][^" + "`" + "']{8,})|BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY'
$matches = $added | Where-Object { $_ -match $pattern }
if ($matches) {
    Write-Host "=== Potential secrets found in added lines ===" -ForegroundColor Red
    $matches | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
}
```

- **If any secrets are detected, STOP immediately.** Do not stash, stage, or commit.
- Report each finding (file + line + matched pattern) to the user and ask whether the secret should be removed or replaced with an environment variable / config lookup before proceeding.
- Common remediation: replace the hardcoded value with `Environment.GetEnvironmentVariable("...")`, a `.env.local` entry (already gitignored), or a CLI `--flag` argument.
- **Only proceed to Step 2 once the scan is clean** (no secret patterns detected) **or** the user has explicitly confirmed the flagged value is safe to commit (e.g. a dummy/example token in test fixtures).
- Suppression: if a flagged value is a known false positive or an intentional test fixture, the user may approve it. Record the approval reason in the commit body as a `Secret-scan exception:` footer line.

### 2. Stash local changes

Stash **all** current uncommitted changes — tracked, modified, and untracked files — before pulling.

```sh
git stash push -u -m "commit auto-stash"
```

- Do not skip this step if `git status` shows any local changes.
- If there are no changes, `git stash` will report "No local changes to save"; that is safe to ignore.
- **If this git command fails for any reason, stop immediately and do not proceed to the next steps.**

### 3. Pull remote updates

Attempt the pull up to 3 times before giving up.

**Bash / WSL / Git Bash**

```sh
for i in 1 2 3; do
  git pull && break
  echo "git pull attempt $i failed"
  if [ "$i" -eq 3 ]; then
    echo "git pull failed after 3 attempts; stopping."
    exit 1
  fi
done
```

**PowerShell (Windows)**

```powershell
$maxAttempts = 3
for ($i = 1; $i -le $maxAttempts; $i++) {
    git pull
    if ($LASTEXITCODE -eq 0) { break }
    Write-Host "git pull attempt $i failed"
    if ($i -eq $maxAttempts) {
        Write-Host "git pull failed after $maxAttempts attempts; stopping."
        exit 1
    }
}
```

- If the pull reports "Already up to date", proceed to the next step.
- **If `git pull` ultimately fails after 3 attempts, stop immediately and do not proceed to the next steps.**

### 4. Pop the stash

```sh
git stash pop
```

- If `git stash pop` reports conflicts, proceed to the conflict gate below.
- **If this git command fails for any reason, stop immediately and do not proceed to the next steps.**

### 5. Resolve conflicts (gate)

Check for unresolved merge conflicts.

```sh
git diff --name-only --diff-filter=U
```

- If the list is non-empty, resolve conflicts based on the current project context.
- If domain knowledge is required to resolve safely, ask the user before choosing a resolution.
- Do **not** proceed until `git status` shows all conflicts resolved and files staged.

### 6. Format changed files

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

### 7. Analyze changes

Review all modified files. Group them logically:

- **Main Change**: the core feature, bug fix, or domain where the majority of changes reside.
- **Unrelated Changes**: isolated modifications, distinct bug fixes, or minor tweaks in other domains.

Use the optional user argument to focus the analysis when provided.

### 8. Commit

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

- **Secret Scan Gate**: Always run the secret scan (Step 1) before stashing or staging. If a secret is detected, halt and remediate before proceeding. The only exception is an explicit user-approved false positive, recorded as a `Secret-scan exception:` footer line in the commit message.
- **Strict Stash/Pull/Pop Sequence**: Never skip the stash step if there are modified tracked files.
- **Conflict Gate**: Halt and ensure clean resolution before analyzing files for the commit message.
- **Single Commit**: All changes, regardless of domain, must be grouped into exactly one commit.
- **Git Command Failure Policy**: If any git command fails for any reason, stop immediately and do not proceed to the next steps.
- **Weighted Messaging**: The commit subject line and primary body must only reference the Main Change.
- **Conditional Footer**: Append the `Unrelated:` footer only if distinct, unrelated changes are present. If all files belong to the Main Change, omit the footer entirely.
- **Automated Execution**: Execute standard git and npx commands autonomously. Pause for user input only if a conflict requires human domain knowledge to resolve safely.
