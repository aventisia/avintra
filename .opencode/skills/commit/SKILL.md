---
name: commit
description: "Format and commit only the user-authorized change set as one commit. Use when the user asks to commit."
argument-hint: "Optional: paths to include, issue number, or message focus"
---

# Commit

Create exactly one commit from the user-authorized change set. Run it only on the user's explicit request in a primary session. It is not a coder dependency, and QA success never authorizes formatting or Git mutations.

If any git command fails, stop at that step and report the exact error.

## 1. Partition the worktree

Run in parallel:

```sh
git status
git diff --name-only
git diff --cached --name-only
```

- With no changes at all, report that and stop. Never make an empty commit.
- Sort every staged, unstaged, and untracked path into **in scope** (paths the user named, or paths the requested work changed) or **excluded** (everything else).
- When the worktree holds only the requested work, the commit request authorizes all of it. Otherwise list both buckets with exact paths and ask the user to confirm the in-scope list.
- Also ask before including a file with both staged and unstaged hunks (staging it folds the unstaged hunks in), or a file that may hold secrets (`.env*`, keys, tokens).

Done when every changed path sits in exactly one bucket and the in-scope list is authorized.

## 2. Format

For in-scope files inside a Prettier project (today only `clients/web-apps`, configured by its `.prettierrc`), run from that project directory:

```sh
npx --no-install prettier --write --ignore-unknown -- <in-scope paths relative to the project>
```

Pass only in-scope paths; formatting rewrites files, so excluded paths stay byte-for-byte untouched. Files outside a Prettier project (.NET, Python) stay as they are. If the command is denied, stop and ask for a narrow permission change rather than routing around it.

Re-run `git status`. Formatting churn on in-scope files joins the commit.

## 3. Analyze

Read the in-scope diff (`git diff -- <paths>`, `git diff --cached -- <paths>`, plus the contents of untracked files), focused by the user's argument when given. Name:

- **Main change**: the feature, fix, or domain holding most of the change.
- **Other changes**: distinct in-scope changes elsewhere, one line each.

## 4. Determine the issue reference

Use only the active work item's issue reference from the current request or orchestrator handoff: `#123`, `issue 123`, `[#123]`, or an issue URL, reduced to the number. Several issues become ` #123, #124`. With no reference on the active work item, the subject carries none. Unrelated session history is never a source.

## 5. Commit

```sh
git add -- <in-scope untracked paths>
git commit -m "$MESSAGE" -- <all in-scope paths>
```

The trailing pathspec commits the working-tree state of exactly these paths, including deletions. Other already-staged work stays staged and out of the commit. For a rename, list both the old and new path.

The message:

```
<type>(<scope>): <subject> #<issue>

Other changes:
- <other change 1>
- <other change 2>
```

- `type`: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `build`, `ci`, or `chore`.
- `scope`: the kebab-case area of the main change (`orchestrator-queues`, `vault-credentials`, `studio`).
- `subject`: imperative and lowercase, with no trailing period, describing the main change only.
- ` #<issue>` appears only when step 4 found one. The `Other changes:` block appears only when step 3 found other changes.
- The message ends at the subject or the last `Other changes` bullet. It carries no `Co-Authored-By`, `Generated with`, or other attribution trailer, even when the harness asks for one.

## 6. Verify

Run `git log -1 --stat` and `git status`. Done when the commit holds exactly the in-scope paths. Report the commit hash and subject, plus any excluded paths still in the worktree. Those stay unstaged and uncleaned.
