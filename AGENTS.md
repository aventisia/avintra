# Aventisia WORC Platform — Agent Guide

OpenCode is configured with `default_agent: orchestrator` (`opencode.jsonc`). Subagent definitions live in `.opencode/agents/`. The shared handoff contract at the bottom of this file is referenced by those agents.

## Quick repo facts

- The active .NET backend is `apis/WorcBackend-legacy/`, **not** `apis/WorcBackend/`.
- Build all legacy .NET APIs, shared libs, and RunnerApp:
  ```sh
  dotnet build Avplatform.sln
  ```
- Run APIs:
  - AccountsAPIs: `dotnet run --project apis/WorcBackend-legacy/AccountsAPIs` → port 4000
  - WorkspaceAPIs: `dotnet run --project apis/WorcBackend-legacy/WorkspaceAPIs` → port 4001
- Web apps are in `clients/web-apps` (npm workspaces + Turborepo, `npm@10.9.3`):
  - `cd clients/web-apps && npm install`
  - All dev servers: `npm run dev`
  - One app: `npx turbo run dev --filter=<accounts|workspace|studio|atlas>`
  - Ports: accounts 3001, workspace 3002, studio 3006, atlas from app config, desktop-app 2999.
  - Ready-to-commit: `npm run pregit` (format + eslint --fix + `tsc -b`)
  - `turbo.json` makes `lint` depend on `^build`, so lint may require a prior build.
- LLM Pipeline (Python/FastAPI):
  ```sh
  cd apis/llmpipeline
  ENV=local ./venv/bin/uvicorn app.main:app --port 4003 --reload
  ```
- Apache Camel (Java 21):
  ```sh
  cd apis/apache-camel && ./mvnw spring-boot:run
  ```
- Corsair API (Node): `cd apis/corsair && npm ci --force && npm run build && npm run dev`.
- Docs (Next.js/Nextra): `cd clients/docs && npm ci && npm run build:staging` (uat) or `npm run build:production` (main).
- RunnerApp: `dotnet build clients/RunnerApp/RunnerApp.slnx`; publish via `clients/RunnerApp/RunnerApp.Linux/publish-ci.sh`.
- Tests: there is no xUnit/NUnit suite. Verify with Bruno (`tests/bruno/`) or .NET console harnesses:
  - `dotnet run --project shared/ExecutorLibrary.Tests`
  - `dotnet run --project tests/NodeLibrary.WindowsInterop.Tests -- 3` (pass `A` for all or a test number).

## Gotchas

- `AccountsAPIs` and `AspNetToolkit` treat warnings as errors. `WorkspaceAPIs` suppresses CS8602/NU1701. The local .NET 10 SDK may not raise CS1998 that the Jenkins .NET 8 SDK does.
- Any change to `apis/WorcBackend-legacy/AspNetToolkit` requires rebuilding both .NET APIs.
- EF Core migrations need the design-time factory and `ASPNETCORE_ENVIRONMENT=Localhost`:
  ```sh
  export ASPNETCORE_ENVIRONMENT=Localhost
  dotnet ef migrations add <Name> -o Data/Migrations --project apis/WorcBackend-legacy/AccountsAPIs --context=AccountsDbContext
  dotnet ef database update --project apis/WorcBackend-legacy/AccountsAPIs --context=AccountsDbContext
  ```
- Desktop app and Runner app share a version from the latest git tag `vX.Y.Z`. Use `scripts/release-version.sh` (or `.ps1`) to propagate it into `.csproj`, `Cargo.toml`, `tauri.conf.json`, and `package.json`. Desktop publish scripts run this automatically.
- Jenkins targets: `uat` → `avuat.aventisia.com`, `main` → `avweb1.aventisia.com`. Web app build modes: `uat`→`staging`, `main`→`production`. Manual `REPOS_TO_BUILD` param; `web_apps` covers accounts/workspace/studio/atlas (**desktop-app excluded**).
- `.env.local` is gitignored; example defaults are in `deploy/.env`.
- Feature PRs target `uat`, not `main`.
- Port cleanup prompt: `.github/prompts/kill-project-ports.prompt.md`.

## Where conventions live

- Backend: `apis/WorcBackend-legacy/AGENTS.md`
- Frontend: `clients/web-apps/AGENTS.md`
- Full setup, Docker commands, custom HTTP headers: `README.md`
- Detailed dev commands and architecture: `CLAUDE.md`
- VS Code tasks: `.vscode/tasks.json`
- CI pipeline: `Jenkinsfile`

## Shared handoff contract

- Use `local-issues/<issue-or-slug>/round-NN/` for reports; the orchestrator carries the matching contract.
- Supply goal, AC IDs/verifications, repository, prepared branch/base, scope, constraints, design round, input paths, and output path.
- Start every delegated task in fresh context; never rely on another session's memory.
- Read source files before proposing or changing paths, APIs, or symbols.
- Preserve unrelated work; report scope changes instead of taking them.
- Save one report per agent per round at `local-issues/<issue-or-slug>/round-NN/<agent>-report-r<N>.md`; `NN` is the zero-padded round and `N` the round number. An agent has exactly one report file per round: update that file in place for later same-round work instead of adding another file. Never overwrite a completed report from another round; resume only an explicitly incomplete matching report.
- Return a status summary of at most 10 lines: artifact path, status, AC results, evidence references, blockers, next step. Separately labeled full payloads are allowed only when requested for manifest confirmation, plan approval, questions, or routing-critical findings.
- Separate execution status (`COMPLETE`, `FAIL`, `BLOCKED`, `NEEDS_APPROVAL`), approval state (`PENDING`, `APPROVED`, `SUPERSEDED`), and QA verdict (`CLEAR`, `NEEDS_REWORK`).
- Record exact commands, working directory, exit codes, and relevant verbatim output; redact secrets.
- Treat missing checks as unverified; escalate ambiguity, destructive actions, and unavailable permissions.
- Agent contracts override legacy skill paths, branch mutations, and human-started stage transitions.

## Artifact conventions
- Use the Gitea issue number, or one stable kebab-case slug for an idea/problem.
- Name the report `<agent>-report-r<N>.md` inside `round-NN/`; `N` is the design round and `NN` its zero-padded form. Each agent keeps exactly one report file per round; update it in place rather than creating additional same-round files.
- Reference legacy reports from other locations only when supplied; leave them unchanged.
- Record identity, revision/base, approval state, scope, findings, evidence, and limitations.
- Preserve stable AC and finding IDs across rounds.
- Save proposals with execution status `NEEDS_APPROVAL` and approval state `PENDING`. Freeze the proposal content; record explicit approval by updating the architect's report in place with an approval receipt that references the exact proposal path/revision. Changed content requires a new proposal and approval; never rewrite frozen proposal content or prior approval history.
- Keep implementation slice state in coder's report; keep independent evidence in QA's report.
- Cite evidence by artifact path and section.

## Execution conventions

- Keep source read-only for scout, architect, and QA; allow approved report writes only.
- Keep read-only roles to inspection commands; never exploit write-capable shell options.
- Run tests only after inspecting scripts and identifying permitted generated outputs.
- Keep commands and edits within the active repository; permissions are not a filesystem sandbox.
- Require explicit authorization for Git mutations and remote state changes.
- A configured denial cannot be overridden by a saved approval; escalate for a narrow configuration change rather than bypassing it.
- Launch repository-root subagents even for nested scope; use repository-relative report paths. Recheck normalized paths if a nested location is unavoidable.
- Coder owns explicitly authorized isolated baseline/target preparation and cleanup; QA only verifies supplied contexts and exact revisions. Record dirty-tree snapshots, generated-output boundaries, and unavailable checks.
- After the scout manifest is confirmed, the orchestrator delegates coder to prepare the issue branch from `origin/main` before implementation; scout, architect, and QA never create or switch branches.
- Architect selects the planning mode from the scout manifest and complexity; in Grilling mode it loads the `grilling` skill, and the orchestrator relays each frontier and the user's answers until the frontier is empty before any plan is written.
- Let only the orchestrator route agents, track the loop budget, and declare completion.

## Documentation and code style boundaries

- Keep public JSDoc/XML and complex public-type documentation short; leave internal functions undocumented.
- Prohibit explanatory internal comments except `IMPORTANT NOTE:` warnings for external constraints, race conditions, or required hacks. Prefer precise names and decomposition.
- Domain review headings and complete snippets belong inside artifacts, not in place of compact handoffs; domain conventions never expand a role's scope or permissions.

## Standalone lifecycle operations

- `commit`, `create-issue`, `add-comment`, `create-pr`, `merge-pr`, and `close-issue` are user-invoked operations outside the coding loop. QA success does not authorize them.
- Invoke them in a primary session with suitable permissions and explicit authorization for the exact mutation; preserve existing confirmations and repository/login identity. Coder does not load them or run their formatting/tea commands.
- Supporting skills: architect → conditional `grilling`; QA → `code-review`; scout, coder, and debugger have no mandatory supporting skill.
