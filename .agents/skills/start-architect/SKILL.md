---
name: start-architect
description: "Read an issue's scout report and any audit findings, recommend a planning mode, produce an approved architecture plan, then stop for a fresh Heavy Typist session."
argument-hint: "Issue number"
user-invocable: true
---

# Architect an Issue

Stage 2 of the issue workflow. Turn the verified scout report into a complete, reviewable implementation plan. Do not implement code or continue into another stage.

## Session Boundary

Each stage runs in its own fresh session and uses a different model from the preceding stage. The human starts the next stage; never load or invoke it from this session.

## When to Use

- `start-issue` has completed and saved `01-scout-report.md`.
- `audit-implementation` found issues and the user is restarting the plan → implementation → audit loop.

## Procedure

### 1. Read the source material

- Resolve the issue number and read `local-issues/<issue-number>/01-scout-report.md`.
- If `local-issues/<issue-number>/04-audit-report.md` exists, read it in full. For an audit loop, plan against every unresolved finding and preserve its finding IDs/references.
- If the scout report is missing, an audit report referenced by the handoff is missing, or the issue number is ambiguous, stop and ask for the correct input. The audit report is optional on the initial planning pass. Do not reconstruct a report from memory.
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

After explicit approval, save the final plan at:

```text
local-issues/<issue-number>/02-architect-plan.md
```

This is the canonical filename. Do not use `02-architect.md` or create a second copy. Record the approval, selected planning mode, issue number, audit findings addressed (if any), plan content, and validation expectations. Do not overwrite an unrelated plan; if a plan exists, update it only for this approved revision and preserve relevant history or decisions.

### 5. Complete Architect stage and stop

After saving the approved plan, report its path, the approval, and any key assumptions. Say the next step is `start-implementation` in a fresh session using a different model (recommended: code-generation model). Do not load or invoke that skill or begin implementation here. Stop.

## Quality Criteria

- The scout report and any audit report were read from their canonical paths.
- The planning mode was recommended with a rationale and used consistently.
- Every known audit finding is addressed or explicitly identified as unresolved with a reason.
- The full plan received explicit human approval before it was saved.
- The approved plan exists at `local-issues/<issue-number>/02-architect-plan.md`.
- The approved plan is ready for the user to start `start-implementation` in a fresh session with a different model; this session stops without invoking it.

## See Also

- `start-issue` — Scout an issue and create its branch.
- `start-implementation` — slice and implement the approved plan.
- `audit-implementation` — review the changed code against the plan.
