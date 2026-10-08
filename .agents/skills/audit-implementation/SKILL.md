---
name: audit-implementation
description: "Review an issue's changed code against its approved architecture plan, save the audit report, and restart the architect loop when findings remain."
argument-hint: "Issue number; optionally include a Gitea PR number or URL"
user-invocable: true
---

# Auditor: Review an Issue

Stage 4 of the issue workflow. Review the implementation against the approved plan using the `code-review` skill, save the result, and either close the loop or request another Architect → Heavy Typist → Auditor cycle. This stage is read-only except for its audit report.

## When to Use

- `start-implementation` has completed its slices and handed off the issue.
- The user asks to audit/re-audit an issue implementation.

## Procedure

### 1. Read the approved artifacts

- Read `local-issues/<issue-number>/02-architect-plan.md` and `03-heavy-typist-slices.md`.
- If `04-audit-report.md` already exists, retain its history and treat the newest round as current.
- If the plan or slices are missing, stop and ask for the missing artifact; do not infer the approved architecture from conversation history.

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

Save or update:

```text
local-issues/<issue-number>/04-audit-report.md
```

Include:

- Audit round, date, issue, reviewed plan revision, and review target (PR or local base/commit).
- The code-review skill's review output and verdict, preserving its scope summary, diffstat, format, and section headings.
- Plan conformance traceability and validation coverage, including gaps or unavailable checks.
- Findings with stable IDs, severity, file/location, impact, and recommended remediation. Preserve earlier rounds when re-auditing and clearly label the latest round/status.
- A final status of exactly `NEEDS_REWORK` or `CLEAR`.

Use `NEEDS_REWORK` for any actionable defect, missed acceptance criterion, unjustified plan deviation, or material validation gap. Use `CLEAR` only when no rework is required and the implementation conforms to the approved plan. Map `CLEAR` to the code-review verdict `pass`; map `NEEDS_REWORK` to `needs revision` or `reject`.

### 5. Close or restart the loop

- **NEEDS_REWORK:** present the findings and ask the user to restart with `start-architect`, providing the issue number and audit report path. The Architect must plan against each finding before Heavy Typist changes code; then rerun this audit. Do not hand findings directly to implementation or fix them yourself.
- **CLEAR:** report that the audit loop is complete and provide the report path. Do not merge, approve, or otherwise change the PR.

Repeat Architect → Heavy Typist → Auditor until the latest report is `CLEAR`.

## Quality Criteria

- The approved plan and slices are compared against every issue-specific change and recorded validation.
- Rework items have stable IDs and are traced through subsequent rounds until resolved.
- The audit report exists at the canonical issue path and records the latest round clearly.
- The result is `NEEDS_REWORK` when any required correction remains, otherwise `CLEAR`.
- The Auditor makes no implementation or PR changes and routes findings back through the Architect.

## See Also

- `code-review` — strict implementation review, including Gitea PR and local change review.
- `start-architect` — plan the implementation or address audit findings.
- `start-implementation` — implement the approved plan and remediation slices.
