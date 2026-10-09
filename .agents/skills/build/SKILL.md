---
name: build
description: "Implement an explicitly approved issue plan, record slices and validation in a per-round build report, then stop for a fresh Auditor session."
argument-hint: "Issue number and approved plan path; optionally request todo-by-todo"
user-invocable: true
---

# Heavy Typist: Implement an Issue

## Session Boundary

Each stage runs in its own fresh session and uses a different model from the preceding stage. The human starts the next stage; never load or invoke it from this session.

## When to Use

Use this workflow after `architect` has saved an explicitly approved plan at `local-issues/<issue-number>/s2-architect-plan-r<N>.md`. The plan's round number determines this build report's round. Do not implement from an unapproved plan or from memory.

## Execution Modes

- **All in one go (default):** implement every slice in order, validating and recording each before starting the next. Do not pause between slices. Present one consolidated implementation report when finished.
- **TODO by TODO:** use only when the user explicitly requests it. Implement and validate one slice, then pause for review before continuing.

## Procedure

1. Read the approved `s2-architect-plan-rN.md`, `s1-scout-report.md` (or legacy `01-scout-report.md` for a preexisting issue), relevant `AGENTS.md` files, each affected feature's local `README.md` when present, current code, and prior audit reports when this is rework. For `rN` greater than 1, use the immediately preceding round's `s4-audit-report-r<previous>.md` (for example, round `r2` reads `s4-audit-report-r1.md`); for `r1`, use a legacy `04-audit-report.md` if present. If a preceding audit exists, confirm it is `NEEDS_REWORK` and every unresolved finding is represented by a remediation task in this plan. Stop if it is `CLEAR`, missing for a rework plan, or any finding is unaccounted for; ask the user to restart `architect` in a fresh session using a different model (recommended: advanced reasoning).
2. Slice the approved plan's goals, phases, and tasks into reviewable work items. Before editing implementation files, create the round's build report at:

   ```text
   local-issues/<issue-number>/s3-build-report-r<N>.md
   ```

   Include the round and plan path, traceability to plan sections, ordered slices, acceptance/validation criteria, status, selected execution mode, validation results, and final implementation summary. This is the only slices/build report for the round; update it as work progresses rather than creating a separate slices file. If the report already exists, resume it only when this same round's build is incomplete; if it is complete, stop and direct the user to Auditor. Never overwrite a completed or earlier-round report.
3. Use **All in one go** unless the user explicitly requested **TODO by TODO**. Record the mode in the build report; do not ask for a mode by default.
4. Implement slices sequentially within the approved scope. For each slice, update its status in the build report and validate it through the narrowest meaningful check available (focused test, Bruno API test, UI review, typecheck, lint, build, or equivalent manual verification) before moving on.
5. In TODO-by-TODO mode, pause after each validated slice for review. In all-in-one mode, continue without intermediate pauses and present one consolidated report at the end.
6. If validation fails, mark the slice blocked and stop. If implementation reveals a required architectural or scope change, stop and ask the user to restart `architect` in a fresh session using a different model (recommended: advanced reasoning); do not silently change the approved plan.
7. Do not stage, commit, or push implementation changes unless the user explicitly asks.
8. When all slices are complete, finalize `s3-build-report-r<N>.md` and report its path. Say the next step is `audit` in a fresh session using a different model (recommended: review/reasoning model). Do not load or invoke that skill. Stop here.

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

- The approved plan at `s2-architect-plan-r<N>.md` was followed, or any required change was returned to the Architect.
- `s3-build-report-r<N>.md` contains every slice, its status, selected mode, validation results, and implementation summary.
- Every slice is complete and validated; failures or remaining gaps are reported rather than hidden.
- The user receives a concise implementation summary and audit instructions; this session stops without invoking another stage.
