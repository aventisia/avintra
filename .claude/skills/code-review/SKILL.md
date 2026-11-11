---
name: code-review
argument-hint: "Diff, commit, branch, file, snippet, or GitHub PR (#123 / URL); optional review focus"
description: "Exacting review of code changes for bugs, structure, reuse, comment discipline, and dead code, ending in a pass / needs revision / reject verdict. Use for any code review, including a GitHub PR number or URL."
---

# Code Review

Review as an **exacting** senior developer: is the code robust, modular, readable at a glance, and consistent with this repository? Judge engineering decisions, not just correctness. Formatting counts only where it hurts readability or maintenance.

## 1. Load the target

- **GitHub PR** (`#123`, `123`, or a PR URL): follow [`github-pr.md`](github-pr.md). The review stays read-only: the PR is never commented on, approved, rejected, or merged. Landing it is `merge-pr`'s job.
- **Branch**: `git diff <base>...HEAD`, with the branch's base (ask when unclear).
- **Commit**: `git show <sha>`.
- **Working tree**: `git diff` plus `git diff --cached`.
- **Snippet or file**: review it as given.

Done when you hold the complete changed-file list and diffstat. Name any file you could not read (binary, generated, fetch failure) instead of reviewing it blind. If a reliable review needs context you lack, say what is missing.

## 2. Load the conventions

Read the root `AGENTS.md`, the area `AGENTS.md` for each touched area (`apis/WorcBackend-legacy/`, `clients/web-apps/`), and each touched feature's `README.md`. Structure and naming are judged against these.

## 3. Apply every rule to every changed file

Each heading is also a report section, in this order.

### 1. Critical Issues & Bugs

Logic flaws, race conditions, unhandled exceptions or promises, data loss, missing authentication or authorization, injection, resource leaks, and breaking changes to state, APIs, or data models. This is the highest-priority section.

### 2. Architecture / Modularity

One responsibility per file. Components, models, utilities, services, and integrations live in separate files inside clear domain boundaries, following the feature-folder layout the area `AGENTS.md` defines. Flag oversized files and logic crammed into one file.

A feature carries the same name on the frontend and the backend: the `src/features/<feature>/` folder, its `.apis.ts` and DTO files, and the backend controller, service, and DTOs name the domain identically, differing only in casing (kebab-case, camelCase, PascalCase). Flag every mismatch (`machines` vs `RunnerController`, `job-schedules` vs `TriggersController`) as an issue, naming both sides and the name to converge on.

### 3. Code Reuse

New logic written where an existing method, hook, helper, utility, or library already does the job, and copy-pasted patterns. Name the existing abstraction to reuse.

### 4. Documentation / Comments

- Precise names and decomposition carry the meaning. A large function held together by explanatory comments needs splitting.
- Exported or public APIs and complex public types carry one short JSDoc/XML sentence describing the contract. Internal functions and variables stay undocumented.
- The only inline comments are `IMPORTANT NOTE:` warnings about external constraints, race conditions, or required hacks.

### 5. Dead Code

Variables, functions, classes, imports, fields, or branches left unused or obsolete by the change, plus stale scaffolding and temporary logic.

### 6. General Quality

Naming, edge cases, clarity, and any other issue that reduces maintainability.

Done when every changed file has been checked against all six sections.

## 4. Report

Open with the scope: changed-file list and diffstat. Then give the six sections in order. Each finding names a `path:line` (or code region) and the concrete fix. Write "None" for an empty section. Close with:

### 7. Verdict

`pass`, `needs revision`, or `reject`, with a one-line reason.

When delegated, write the review into the assigned report and return the shared compact status summary. Include the full findings payload only when asked for routing.
