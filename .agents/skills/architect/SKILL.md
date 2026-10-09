---
name: architect
description: "Read an issue's scout report and audit findings, create the approved plan for the next round, then stop for a fresh Heavy Typist session."
argument-hint: "Issue number"
user-invocable: true
---

# Architect an Issue

Stage 2 of the issue workflow. Turn the verified scout report into a complete, reviewable implementation plan. Do not implement code or continue into another stage.

## Session Boundary

Each stage runs in its own fresh session and uses a different model from the preceding stage. The human starts the next stage; never load or invoke it from this session.

## When to Use

- `scout` has completed and saved `s1-scout-report.md`.
- `audit` found issues and the user is restarting the plan → build → audit loop.

## Procedure

### 1. Read the source material

- Resolve the issue number and read `local-issues/<issue-number>/s1-scout-report.md`. For a preexisting issue only, if it is absent, read legacy `01-scout-report.md` without changing it.
- Determine the round before drafting: use `r1` when no numbered round exists; after a latest numbered audit `s4-audit-report-rN.md` with `NEEDS_REWORK`, use `rN+1`. Read the latest audit and its matching plan/build reports, plus earlier audit reports needed to track finding history. If only a legacy audit exists, read it and any related legacy plan/build reports as context and use `r1` for the first numbered rework round.
- If the latest audit, numbered or legacy, is `CLEAR`, stop; it is terminal. If a required report is missing, the round is ambiguous, or a completed plan already exists for the selected round, stop and ask for clarification. Do not reconstruct artifacts from memory or overwrite a completed round.
- Read current code, relevant `AGENTS.md` files, and each affected feature's local `README.md` when present before finalizing technical choices.

### 2. Recommend a planning mode

Recommend one mode with a brief rationale:

- **Simple** — localized change, clear requirements, limited to one area, with no significant contract or architectural decision.
- **Grilling** — multiple areas, schema/API/contract or architectural impact, important ambiguity, or substantial unknowns.

State the recommendation before planning. For a Simple recommendation, proceed unless the user redirects. If Grilling is recommended, ask the user to confirm that mode, then use the `grilling` skill to resolve significant open decisions. Ask focused questions when an answer is required to avoid inventing behavior; record remaining assumptions rather than silently filling gaps.

### 3. Draft the full plan and obtain approval

Present a complete plan in the conversation before saving it. Include:

- Goal, scope, non-goals, and acceptance criteria.
- Proposed design, component interactions, and relevant data/control flow.
- Affected files or areas, based on the scout manifest and verified against current code.
- Ordered implementation tasks with clear boundaries.
- Edge cases, compatibility, security, migration/data implications, and failure behavior as applicable.
- Validation strategy, risks, and unresolved assumptions.
- Documentation expectations per the `AGENTS.md` code-style boundaries (no implementation comments; short docs on public boundaries only).
- For an audit loop, a mapping from each unresolved audit finding to its remediation task and validation.

Ask the user to approve, revise, or stop. Do not save the plan until the user explicitly approves it. If revised, present the complete revised plan and ask again. Do not continue into implementation in this session.

### 4. Save the approved plan

After explicit approval, save the final plan at the selected round's path:

```text
local-issues/<issue-number>/s2-architect-plan-r<N>.md
```

Record the round, approval, selected planning mode, issue number, audit findings addressed (if any), plan content, and validation expectations. Each rework plan gets a new round file; never append rounds to one plan or overwrite an existing round. Keep legacy `02-architect-plan.md` unchanged.

### 5. Complete Architect stage and stop

After saving the approved plan, report its path, the approval, and any key assumptions. Say the next step is `build` in a fresh session using a different model (recommended: code-generation model). Do not load or invoke that skill or begin implementation here. Stop.

## Quality Criteria

- The scout report and all relevant round-specific audit/build/plan reports were read.
- The planning mode was recommended with a rationale and used consistently.
- Every known audit finding is addressed or explicitly identified as unresolved with a reason.
- The full plan received explicit human approval before it was saved.
- The approved plan exists at `local-issues/<issue-number>/s2-architect-plan-r<N>.md` for the selected round.
- The approved plan is ready for the user to start `build` in a fresh session with a different model; this session stops without invoking it.

## See Also

- `scout` — Scout an issue and create its branch.
- `build` — slice and implement the approved plan.
- `audit` — review the changed code against the plan.
