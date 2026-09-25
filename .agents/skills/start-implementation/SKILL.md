---
name: start-implementation
description: "Use when an implementation plan has already been discussed and agreed. Save it to local-plans/<plan-name>.md, slice it into reviewable TODOs, and implement one validated TODO at a time."
argument-hint: "Provide the agreed implementation plan"
user-invocable: true
---

# Start Implementation

## When to Use

Use this workflow after the implementation plan has already been discussed and agreed, before changing implementation files.

## Procedure

1. Derive a concise, descriptive filename from the plan's subject, using the format `local-plans/<plan-name>.md` at the repository root. Reuse an existing matching plan file when appropriate.
2. Slice the agreed plan into TODOs and save the complete plan, TODOs, and statuses to that file before editing implementation files.
3. Select the next incomplete TODO in order and implement only that TODO.
4. Validate it through the narrowest meaningful check available: UI review, Bruno API testing, a focused test, typecheck, lint, build, or equivalent manual verification.
5. Update the local plan with the TODO status and validation result, then pause for review before starting the next TODO.
6. Repeat until all TODOs are complete.

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
- Every TODO is marked complete.
- Each TODO was implemented sequentially and validated before the next began.
- The local plan records validation results and any remaining gaps.
