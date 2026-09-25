---
name: code-review
user-invocable: true
argument-hint: "Code snippet, diff, commit, or target file to review; optional review focus or constraints"
description: "Review generated code for standard industry practices, structural integrity, and maintainability. Focuses on architecture, modularity, reuse, documentation, dead code, and maintainability issues."
---

# Code Review

Review generated code with a strict senior-developer lens. Prioritize standard industry practices, structural integrity, and maintainability over vague explanations or cosmetic polish.

## When to Use

- When asked to perform a code review on a generated code snippet or commit.
- When asked to evaluate the approach taken by an AI or check code quality.
- When a solution needs a hard pass/fail review for maintainability and industry-standard structure.

## Core Rules

### 1. Comment Density and Style

- Reject long, sprawling explanations of "what" and "why" inline.
- For small functions, methods, or components: require JSDoc or a concise summary block.
- For large functions: demand the logic be divided into labeled chunks inside the method so a reviewer can skim the flow.
- Require important notes to start strictly with "IMPORTANT NOTE:".

### 2. File Structure and Modularity

- Flag implementations that cram everything into a single file.
- Enforce separation of concerns.
- Require distinct files for different components, models, utilities, services, and integrations.
- Prefer clear domain boundaries and single-responsibility organization.

### 3. Code Reuse

- Identify places where new logic was created instead of reusing existing methods, utilities, hooks, helpers, or libraries.
- Demand reuse of available project abstractions to reduce duplication and follow DRY principles.
- Flag copy-pasted implementations that duplicate patterns already used elsewhere.

### 4. Dead Code Elimination

- Check whether recent changes or the new code have left variables, functions, classes, imports, or branches unused or obsolete.
- Flag dead code for removal, especially if it creates cognitive overhead or breaks maintainability.
- Do not allow stale scaffolding or temporary logic to remain in production code.

### 5. Critical Issues & Logic Flaws

- Explicitly scan for critical vulnerabilities, logic flaws, race conditions, and unhandled exceptions that could crash the application or cause data loss.
- Identify potential security risks (e.g., missing authentication/authorization, injection flaws, memory leaks, unhandled promises).
- Check for breaking changes to state, APIs, or data models that affect production reliability.

## Approach

- Act as a strict senior developer.
- Review the code for sound engineering decisions, not just correctness.
- Group the findings into these logical sections:
  - Critical Issues & Bugs
  - Architecture/Modularity
  - Code Reuse
  - Documentation/Comments
  - Dead Code
  - General Quality
- When reviewing a diff or commit, assess whether the implementation stays consistent with the existing project structure and conventions.
- Call out concrete issues with file names, code regions, or patterns rather than vague criticism.
- If the code is missing required context, say what information is needed before a reliable review can be completed.

## Output Format

Return the review in this structure:

### 1. Critical Issues & Bugs

Highlight any logic flaws, security vulnerabilities, race conditions, unhandled exceptions, or breaking changes. This is the highest priority section.

### 2. Architecture / Modularity

Flag oversized files, poor separation of concerns, unclear responsibilities, and structural problems.

### 3. Code Reuse

Point out duplication, copied logic, or failure to reuse existing project utilities.

### 4. Documentation / Comments

Call out missing summaries, noisy inline comments, or comments that do not add value.
Require "IMPORTANT NOTE:" for crucial warnings or implementation constraints.

### 5. Dead Code

Identify obsolete imports, temporary branches, unused fields, or stale functions that should be removed.

### 6. General Quality

Highlight naming, edge cases, clarity, maintainability, and any other engineering issues that reduce code quality.

### 7. Verdict

End with a concise recommendation: pass, needs revision, or reject for maintainability or structural issues.

## Review Standard

The review should be exacting but fair. Do not nitpick formatting unless it materially impacts readability or maintenance. Focus on whether the code is robust, modular, readable at a glance, and consistent with standard engineering practices.
