---
name: start-implementation
description: "Use when an implementation plan has already been discussed and agreed. Save it to local-plans/<plan-name>.md, slice it into reviewable TODOs, and implement them in the chosen execution mode: TODO by TODO (default) or all in one go."
argument-hint: "Provide the agreed implementation plan and the execution mode (todo-by-todo or all-in-one)"
user-invocable: true
---

# Start Implementation

## When to Use

Use this workflow after the implementation plan has already been discussed and agreed, before changing implementation files.

## Execution Modes

- **TODO by TODO (default):** implement one validated TODO at a time, pausing for review after each. Use for larger or cross-area plans.
- **All in one go:** implement the remaining TODOs in order, validating each one and updating the plan as it completes, then present a single consolidated review. Use only for small, tightly coupled plans (≤3 TODOs, single area). If a TODO fails validation, stop immediately, mark it blocked, and report instead of continuing.

## Procedure

1. Derive a concise, descriptive filename from the plan's subject, using the format `local-plans/<plan-name>.md` at the repository root. Reuse an existing matching plan file when appropriate.
2. Slice the agreed plan into TODOs and save the complete plan, TODOs, statuses, and the selected execution mode to that file before editing implementation files. If no mode was provided, ask: recommend TODO by TODO for larger or cross-area plans, and all in one go only for small, tightly coupled plans.
3. Implement TODOs in the selected mode:
   - **TODO by TODO:** implement only the next incomplete TODO, then continue to validation.
   - **All in one go:** implement the remaining TODOs in order. Validate each one and update its status before starting the next, without pausing for review between them.
4. Validate each implemented TODO through the narrowest meaningful check available: UI review, Bruno API testing, a focused test, typecheck, lint, build, or equivalent manual verification.
5. Update the local plan with the TODO status and validation result.
6. Pause for review after each TODO (TODO by TODO mode) or once after the final TODO (all in one go).
7. Repeat until all TODOs are complete.

## TODO Slicing Rules

- Keep each TODO substantial, self-contained, and independently reviewable.
- Give each TODO a clear implementation boundary and an observable validation path.
- Combine tightly coupled edits that cannot be meaningfully reviewed separately.
- Split very large work across independently testable UI, API, or backend behavior.
- Avoid trivial edits, vague investigation, and broad milestones such as "finish the feature."
- Use only as many TODOs as the plan needs: simple plans may have two to four; larger plans may need more.

## Completion Criteria

The workflow is complete only when:

- The appropriately named `local-plans/<plan-name>.md` file contains the complete plan and all TODO statuses.
- The selected execution mode is recorded in the plan file.
- Every TODO is marked complete.
- Each TODO was implemented sequentially and validated before the next began.
- The local plan records validation results and any remaining gaps.
