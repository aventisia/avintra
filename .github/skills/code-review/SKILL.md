---
name: code-review
user-invocable: true
argument-hint: "Target to review (e.g., uncommitted changes, HEAD, specific branch) and the plan file"
description: 'Review the current changes against the initial development plan and coding standards. Focuses on identifying scope creep (extra code) and categorizing findings by severity (Critical/Medium/Minor). Optimized for iterative local workflows.'
---

# Multi-Axis Code Review

Review the diff between the current working state and a fixed point along three independent axes: **Spec & Scope**, **Standards**, and **Severity Triage**.

## Process

### 1. Pin the Fixed Point and Changes
Identify what needs reviewing. If the user does not specify, default to reviewing **uncommitted changes** (staged and unstaged) or the diff against `HEAD`. Capture the diff via `git diff HEAD` or `git diff <fixed-point>...HEAD`. Confirm the diff is non-empty before proceeding.

### 2. Identify the Spec (The Plan)
Instead of searching for remote issue trackers, locate the plan generated at the start of the workflow:
1. Look for a plan file provided in the prompt (e.g., `plan.md`, `todo.md`).
2. Look for the most recent conversation context establishing the feature requirements.
3. If no plan is found, explicitly ask the user to provide the plan or prompt they used to generate the code. 

### 3. Evaluate Axis 1: Spec & Scope
Cross-reference the diff against the plan. Report on:
- **Missing Requirements:** What was in the plan but is missing in the code?
- **Scope Creep (Extra Code):** What code was added that serves no clear purpose in fulfilling the plan? Flag speculative generality, unnecessary UI components, or unrequested backend logic.
- **Incorrect Implementation:** Code that attempts to fulfill the plan but takes the wrong approach.

### 4. Evaluate Axis 2: Standards & Code Quality
Review the code for structural and qualitative issues.
- **Project Standards:** Check for `CODING_STANDARDS.md` or `.eslintrc`/`.editorconfig` rules. 
- **Stack-Specific Checks:** Ensure React components handle state and keys correctly, and ASP.NET controllers/services maintain clear data contracts and error handling between the frontend and backend.
- **Code Smells (Baseline):**
  - *Mysterious Name:* Rename unclear functions or variables.
  - *Duplicated Code:* Extract shared logic across files.
  - *Primitive Obsession:* Replace primitives with domain types where necessary.
  - *Message Chains:* Hide long property navigations (`a.b.c.d`).
  - *Feature Envy / Data Clumps:* Group data and the methods that act on it logically.

### 5. Evaluate Axis 3: Severity Triage
Categorize all findings from the Spec and Standards axes into actionable severity levels to streamline the user's manual review:
- **Critical:** Security flaws, unhandled exceptions, breaking UI errors, or severe deviations from the plan.
- **Medium:** Performance bottlenecks, missing edge-case handling, or significant code smells.
- **Minor (Optional/Skip):** Nitpicks on formatting (skip if tooling handles this) or subjective style differences.

## Output Format
Present the final report using the following structure. Keep descriptions concise and quote the specific hunk or file path.

### 1. Scope Validation
*Did the code stick strictly to the plan? List missing items and any extra/unnecessary code.*

### 2. Critical & Medium Issues
*List actionable, high-priority issues categorized by severity. Cite the specific file and line.*

### 3. Standards & Smells
*Highlight architectural or code-quality improvements.*

### 4. Summary
*Provide a one-sentence verdict on whether the code is ready for final manual review or requires another LLM refactor pass.*