---
name: start-implementation
description: "Implement an explicitly approved issue plan: save reviewable slices, implement all in one go by default, then hand off to audit-implementation."
argument-hint: "Issue number and approved plan path; optionally request todo-by-todo"
user-invocable: true
---

# Heavy Typist: Implement an Issue

## When to Use

Use this workflow after `start-architect` has saved an explicitly approved plan at `local-issues/<issue-number>/02-architect-plan.md`. Do not implement from an unapproved plan or from memory.

## Execution Modes

- **All in one go (default):** implement every slice in order, validating and recording each before starting the next. Do not pause between slices. Present one consolidated implementation report when finished.
- **TODO by TODO:** use only when the user explicitly requests it. Implement and validate one slice, then pause for review before continuing.

## Procedure

1. Read `local-issues/<issue-number>/02-architect-plan.md`, the relevant `AGENTS.md` files, each affected feature's local `README.md` when present, current code, and the latest `04-audit-report.md` if it exists. For audit rework, proceed only when every unresolved finding is represented by a remediation task in the newly approved plan; otherwise stop and hand back to `start-architect`.
2. Slice the approved plan's goals, phases, and tasks into reviewable work items. Save them before editing implementation files at:

   ```text
   local-issues/<issue-number>/03-heavy-typist-slices.md
   ```

   Include traceability to plan sections, ordered slices, acceptance/validation criteria, status, and selected execution mode. Reuse and update an existing slices file when resuming; preserve completed work and validation results.
3. Use **All in one go** unless the user explicitly requested **TODO by TODO**. Record the mode in the slices file; do not ask for a mode by default.
4. Implement slices sequentially within the approved scope. For each slice, update its status and validate it through the narrowest meaningful check available (focused test, Bruno API test, UI review, typecheck, lint, build, or equivalent manual verification) before moving on.
5. In TODO-by-TODO mode, pause after each validated slice for review. In all-in-one mode, continue without intermediate pauses and present one consolidated report at the end.
6. If validation fails, mark the slice blocked and stop. If implementation reveals a required architectural or scope change, stop and return to `start-architect`; do not silently change the approved plan.
7. Do not stage, commit, or push implementation changes unless the user explicitly asks.
8. When all slices are complete, hand off to `audit-implementation` with the issue number and plan path.

## Documentation Rules

- Apply the root `AGENTS.md` "Documentation and Code Style Boundaries" to every slice.
- Do not add inline comments that explain syntax or internal logic; use precise names instead.
- Write short JSDoc/XML only for exported interfaces, public APIs, and complex types; leave internal functions undocumented.
- The only permitted inline comments are `IMPORTANT NOTE:` warnings about external constraints, race conditions, or required hacks.
- Read each affected feature's local `README.md` before changing it.

## TODO Slicing Rules

- Keep each slice substantial, self-contained, and independently verifiable.
- Give each slice a clear implementation boundary and observable acceptance/validation path.
- Combine tightly coupled edits that cannot be meaningfully reviewed separately.
- Split work by independently testable behavior or subsystem when that improves reviewability.
- Avoid trivial edits, vague investigation, and broad milestones such as "finish the feature."
- Use only as many slices as the approved plan needs.

## Completion Criteria

The workflow is complete only when:

- The approved plan at `02-architect-plan.md` was followed, or any required change was returned to the Architect.
- `03-heavy-typist-slices.md` contains every slice, its status, the selected mode, and validation results.
- Every slice is complete and validated; failures or remaining gaps are reported rather than hidden.
- The user receives a concise implementation summary and the handoff to `audit-implementation`.
