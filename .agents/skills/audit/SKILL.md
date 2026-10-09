---
name: audit
description: "Review an issue's changed code against its approved plan, save a separate audit report for that round, then stop or request a fresh Architect session."
argument-hint: "Issue number; optionally include a Gitea PR number or URL"
user-invocable: true
---

# Auditor: Review an Issue

Stage 4 of the issue workflow. Review the implementation against the approved plan using the `code-review` skill, save the result, and stop. If findings remain, ask the user to start a new Architect session; do not continue the loop here. This stage is read-only except for its audit report.

## Session Boundary

Each stage runs in its own fresh session and uses a different model from the preceding stage. The human starts the next stage; never load or invoke it from this session.

## When to Use

- `build` has completed its slices and handed off the issue.
- The user asks to audit/re-audit an issue implementation.

## Procedure

### 1. Read the approved artifacts

- Resolve `N` as the latest numbered round with a matching approved plan and complete build report that has not yet received a completed audit. For `N` greater than 1, confirm the preceding audit is `NEEDS_REWORK`.
- Read the matching `local-issues/<issue-number>/s2-architect-plan-r<N>.md` and `s3-build-report-r<N>.md`; confirm both use the same round and that every build slice is complete with validation recorded. Read earlier audit reports as needed to track finding history and remediation status.
- If the matching plan or build report is missing, the rounds do not match, or an audit report for this round is already complete, stop and ask for clarification. Do not infer the approved architecture from conversation history or overwrite a completed report.

### 2. Establish the exact review scope

- If a Gitea PR number or URL is supplied, load and follow the `code-review` skill's PR procedure.
- Otherwise review the local implementation diff/commit with the `code-review` skill. Include the branch changes against the plan's target base plus relevant staged, unstaged, and untracked implementation files. Use the issue branch's actual base when known; do not assume the entire worktree belongs to this issue.
- Separate unrelated user changes from the issue's changed code; if the scope cannot be established safely, ask before reviewing. Identify the base/target in the audit report, and exclude the audit report itself from implementation code.

### 3. Review against code and plan

- Load and follow the `code-review` skill for code-quality criteria and review output, including the `AGENTS.md` documentation boundaries (no implementation comments; short docs on public boundaries only). Do not duplicate its checklist here.
- Review code quality and plan conformance together: for each approved goal, requirement, or architecture decision, identify the implementing code and validation evidence, or report the gap/deviation.
- Preserve the code-review findings and verdict. Add plan-conformance gaps as separate findings, with stable IDs and severity for the rework loop.
- Do not edit implementation code, fix findings, or modify the Gitea issue/PR. The code-review skill is read-only for PRs.

For the plan comparison, record a compact traceability table in the report: plan requirement/decision → changed file or symbol → validation evidence → result. Include unimplemented requirements, unapproved scope or architecture changes, and missing validation as findings. If required context is unavailable, state what is missing and do not claim a reliable `CLEAR` result.

### 4. Save the audit report

Save the audit for the same round as the reviewed plan and build report:

```text
local-issues/<issue-number>/s4-audit-report-r<N>.md
```

Include:

- Audit round, date, issue, reviewed plan/build paths, and review target (PR or local base/commit).
- The code-review skill's review output and verdict, preserving its scope summary, diffstat, format, and section headings.
- Plan conformance traceability and validation coverage, including gaps or unavailable checks.
- Findings with stable IDs, severity, file/location, impact, and recommended remediation. For rework, trace prior finding IDs as resolved or still open; keep each round's report separate.
- A final status of exactly `NEEDS_REWORK` or `CLEAR`.

Use `NEEDS_REWORK` for any actionable defect, missed acceptance criterion, unjustified plan deviation, or material validation gap. Use `CLEAR` only when no rework is required and the implementation conforms to the approved plan. Map `CLEAR` to the code-review verdict `pass`; map `NEEDS_REWORK` to `needs revision` or `reject`.

### 5. Close or restart the loop

- **NEEDS_REWORK:** present the findings and ask the user to start `architect` in a fresh session using a different model (recommended: advanced reasoning), providing the issue number and audit report path. The Architect must plan against each finding before Builder changes code. Do not load or invoke the Architect, hand findings directly to implementation, or fix them yourself. Stop after reporting.
- **CLEAR:** report that the audit loop is complete and provide the report path. Do not merge, approve, or otherwise change the PR. Stop.

For rework, the human starts each Architect → Heavy Typist → Auditor stage in its own fresh session with a different model from the preceding stage. Repeat until the latest report is `CLEAR`.

## Quality Criteria

- The matching approved plan and build report are compared against every issue-specific change and recorded validation.
- Rework items have stable IDs and are traced through subsequent rounds until resolved.
- The audit report exists at `s4-audit-report-r<N>.md` and records the result for that round without overwriting earlier rounds.
- The result is `NEEDS_REWORK` when any required correction remains, otherwise `CLEAR`.
- The Auditor makes no implementation or PR changes and routes findings back through the Architect.

## See Also

- `code-review` — strict implementation review, including Gitea PR and local change review.
- `architect` — plan the implementation or address audit findings.
- `build` — implement the approved plan and remediation slices.
