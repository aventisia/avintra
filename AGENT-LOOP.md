# Agent loop

Binds `orchestrator`, the only primary agent, and every subagent it launches.

## Shared handoff contract

- Reports live at `local-issues/<key>/round-NN/<agent>-report-r<N>.md`: `<key>` is the GitHub issue number or one stable kebab-case slug, `N` the design round, `NN` its zero-padded form. Each agent keeps one report per round, updated in place. Never overwrite another round's completed report; resume only an explicitly incomplete matching one.
- Each delegation is a fresh session: context travels only through the task message and the reports it lists. Read every listed report from disk before inspecting source or acting.
- Read the source before proposing or changing a path, API, or symbol.
- Preserve unrelated work; report a scope change instead of making it.
- Return a status summary of at most 10 lines: artifact path, status, AC results, evidence references, blockers, next step. Add labeled full payloads only on request, for the brief, final brief and PR report, plan approval, questions, or routing-critical findings. Full review headings and snippets stay in the artifact.
- Keep status vocabularies separate: execution `COMPLETE`/`FAIL`/`BLOCKED`/`NEEDS_APPROVAL`; approval `PENDING`/`APPROVED`/`SUPERSEDED`; QA verdict `CLEAR`/`NEEDS_REWORK`; pentest evidence `EXPLOITED`/`REACHABLE`/`SUSPECTED`; merge safety `SAFE`/`CONDITIONAL`/`UNSAFE`.
- Record exact commands, working directory, exit codes, and relevant verbatim output, with secrets redacted.
- A missing check is unverified. Escalate ambiguity, destructive actions, and unavailable permissions.
- Agent contracts win over a skill's paths, branch mutations, and human-started stage transitions. Area conventions never widen a role's scope or permissions.

## Artifact conventions

- Use reports from other locations only when supplied, and leave them unchanged.
- Record identity, revision/base, approval state, scope, findings, evidence, and limitations; cite evidence by artifact path and section.
- Keep AC and finding IDs stable across rounds.
- The analyst's brief is the user's standing approval: revised in place until the user explicitly approves an exact revision, then frozen. An issue brief that scout finds current per `.claude/skills/BRIEF.md` is already approved, and analyst adopts it as the approved `rev1`. Its checklist IDs are the ACs.
- A saved proposal is frozen. One within the approved brief carries a brief-authorized receipt citing the brief revision. Any other is saved `NEEDS_APPROVAL`/`PENDING` until the user explicitly approves it, and architect then adds an approval receipt for the exact proposal path and revision to its report. Changed content needs a new proposal and approval; frozen proposals and approval history are never rewritten.
- Each kind of state has one home: implementation slices in coder's report; attack attempts, PoCs, and security findings in pentester's; UI runs, screenshots, and UI findings in pilot's; independent evidence, blast radius, and merge safety in QA's.
- After QA `CLEAR`, analyst writes `local-issues/<key>/final-brief.md` and `local-issues/<key>/pr-report.md` outside the round folders; each wrap-up rewrites both.

## Execution conventions

- Scout, analyst, architect, pentester, pilot, and QA keep source read-only and run inspection commands only, never write-capable shell options. They write only their approved reports, plus `poc-*` (pentester) and `ui-*` plus `evidence.md` (pilot) artifacts in their round directory.
- Run a test only after inspecting its script for side effects and generated outputs.
- Keep commands and edits inside the active repository; permissions are not a filesystem sandbox.
- Git and remote-state mutations need explicit authorization, with one standing exception: after scout's investigation and before the brief, the orchestrator has coder create the issue branch from `origin/main` and push it without asking. No other role creates or switches branches.
- A saved approval never overrides a configured denial; escalate for a narrow configuration change instead of bypassing it.
- Coder alone prepares and cleans up explicitly authorized isolated baseline/target contexts; QA verifies only supplied contexts and exact revisions.
- Coder's `FINAL` report and status summary flag a risky surface (endpoints or auth, tenant/space filters or raw SQL, ID-carrying DTOs, credentials or vault, LLM prompt or tool-output assembly, file or path handling, Tauri commands or `capabilities/`, RunnerApp execution inputs, dependency manifests) and a UI surface (`clients/web-apps/**`).
- Coder's `FINAL` also leaves the local `dekit` stack serving the change, so pentester and pilot test it as given.
- Pentester runs after coder `FINAL` and before QA only on a risky surface. It attacks localhost fixtures only and never fixes code; QA confirms or rejects every finding.
- Pilot runs after any pentest and before QA when the change has a UI surface or an AC a user sees in a web app. It drives the web UI in Orca's built-in browser (`orca-cli` skill) against localhost fixtures only, never fixes code, and returns `BLOCKED` when the browser or a service does not respond. QA accepts its recorded `PASS` results after checking them and repeats every failure itself before it blocks.
- Low and Info findings (except a confirmed `EXPLOITED` security finding), `SUSPECTED` security findings, and pre-existing observations never block; they become follow-ups in the final brief and PR report. A QA run blocked only by a missing verification environment escalates as `BLOCKED` instead of starting a design round.
- Architect picks the planning mode from the scout manifest and complexity and settles what the approved brief covers on its own recommendation; the orchestrator relays only uncovered questions and the user's answers until the frontier is empty, before any plan is written.
- Only the orchestrator routes agents, tracks the loop budget, and declares completion.
- Supporting skills: architect → `grilling` in Grilling mode; QA → `code-review`, plus `orca-cli` to repeat a pilot failure; pilot → `orca-cli`; the other roles need none.
- The lifecycle operations in root `AGENTS.md` stay outside the loop: QA success never authorizes them, and coder never loads them or runs their formatting or `gh` commands.
