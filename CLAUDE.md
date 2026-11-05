# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

The README references a newer `apis/WorcBackend/` solution, but the active, buildable .NET backend is `apis/WorcBackend-legacy/`.

Primary branches: `uat`, `main`. Feature PRs target `uat`.

CI/CD is Jenkins (root `Jenkinsfile`). There are no GitHub Actions or pre-commit hooks.

## Non-obvious commands

```sh
# Python LLM pipeline local run — ENV=local loads .env and .env.local via pydantic-settings
cd apis/llmpipeline && ENV=local ./venv/bin/uvicorn app.main:app --port 4003 --reload

# Corsair needs --force on install
cd apis/corsair && npm ci --force && npm run build && npm run dev
```

### Tests

There is no xUnit/NUnit test suite. Verification is a mix of:

- **API-level**: Bruno collection in `tests/bruno/` (environments under `tests/bruno/environments/`).
- **.NET harnesses** (custom console runners, run with `dotnet run --project <path>`):
  - `shared/ExecutorLibrary.Tests` — manual harness for `FlowProcessor` / `DynamicJson` / `NodeArgumentHelper`.
  - `tests/NodeLibrary.WindowsInterop.Tests` — Windows-only, interactive by default; pass `-- A` to run all or `-- <n>` to run one test.

## Important conventions and gotchas

- **Code comments**: Do not add explanatory internal comments; prefer precise names and decomposition. Only `IMPORTANT NOTE:` comments for external constraints, race conditions, or required hacks. Keep public JSDoc/XML short and leave internal functions undocumented.
- **Git mutations**: Commits, PRs, and issue operations are user-invoked (`/commit` skill in `.claude/skills/`); the remote tracker is GitHub (`aventisia/avintra`); Gitea is archived. Do not run git mutations without explicit authorization.
- **Agent workflow files**: `AGENTS.md` (root) defines the multi-agent handoff contract used by `.opencode/agents/`; reports go under `local-issues/<issue-or-slug>/round-NN/`. `local-*` directories (`local-issues`, `local-ref`, `local-feature-context`) are gitignored scratch/context, not source.
- **Environment files**: `.env.local` is gitignored. `deploy/.env` contains example/default values. Do not commit secrets.
- **Versioning**: The Desktop app and Runner app share a version sourced from the latest git tag (`v<X.Y.Z>`). Run `scripts/release-version.sh` (Linux/macOS) or `scripts/release-version.ps1` (Windows) to propagate the version into `.csproj`, `Cargo.toml`, `tauri.conf.json`, and `package.json`. The Tauri build script calls this automatically.
- **Corsair boundary**: Read `apis/corsair/README.md` before changing the Workspace↔Corsair boundary.

## Where to look next

- Per-area conventions: `apis/WorcBackend-legacy/AGENTS.md`, `clients/web-apps/AGENTS.md`
- Root agent guide and handoff contract: `AGENTS.md`
- Full setup and Docker commands: `README.md`
- VS Code launch tasks: `.vscode/tasks.json`
- Jenkins pipeline: `Jenkinsfile`
