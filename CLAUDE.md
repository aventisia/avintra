# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

This is the **Aventisia WORC Platform** monorepo: a workflow automation / RPA platform with a React + Vite frontend, a legacy ASP.NET Core 8 backend, a Python/FastAPI LLM pipeline, an Apache Camel integration service, a .NET flow-execution engine, and a Tauri desktop runner. The README references a newer `apis/WorcBackend/` solution, but the active, buildable .NET backend is `apis/WorcBackend-legacy/`.

Primary branches: `dev`, `uat`, `main`. Feature PRs target `uat`.

CI/CD is Jenkins (root `Jenkinsfile`). There are no GitHub Actions or pre-commit hooks.

## Developer commands

### .NET APIs

```sh
# Build everything in the main solution (legacy APIs + shared libs + RunnerApp)
dotnet build Avplatform.sln

# Run a single API
dotnet run --project apis/WorcBackend-legacy/AccountsAPIs   # port 4000
dotnet run --project apis/WorcBackend-legacy/WorkspaceAPIs  # port 4001

# Publish a single API
dotnet publish -c Release --property:PublishDir=./Published apis/WorcBackend-legacy/AccountsAPIs

# EF Core migrations — set the environment so .env.local values are loaded
export ASPNETCORE_ENVIRONMENT=Localhost
dotnet ef migrations add <Name> -o Data/Migrations --project apis/WorcBackend-legacy/AccountsAPIs --context=AccountsDbContext
dotnet ef database update --project apis/WorcBackend-legacy/AccountsAPIs --context=AccountsDbContext
```

Both APIs depend on `AspNetToolkit`; if that library changes, both APIs must be rebuilt. Jenkins detects changes in `AspNetToolkit` and rebuilds both APIs automatically.

### Python LLM Pipeline API

```sh
cd apis/llmpipeline
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Local dev run (root_path `/api`, port 4003)
ENV=local ./venv/bin/uvicorn app.main:app --port 4003 --reload
```

`ENV=local` loads `.env` and `.env.local` via pydantic-settings.

### Web apps (`clients/web-apps`)

Uses npm workspaces + Turborepo. `packageManager` is `npm@10.9.3`.

```sh
cd clients/web-apps
npm install

npm run dev          # start all app dev servers
npm run build        # type-check + build all apps
npm run typecheck    # turbo typecheck across workspaces
npm run lint         # turbo lint across workspaces
npm run format       # prettier all source files
npm run pregit       # format + eslint --fix + tsc -b (ready-to-commit)
```

Run one app:

```sh
npx turbo run dev --filter=accounts   # port 3001
npx turbo run dev --filter=workspace  # port 3002
npx turbo run dev --filter=studio     # port 3006
npx turbo run dev --filter=atlas      # port defined in app config
```

Turbo task dependencies (from `turbo.json`):

- `build` depends on `^build`
- `typecheck` depends on `^typecheck`
- `lint` depends on `^build`

Apps `accounts`, `studio`, and `desktop-app` use `--max-warnings 0`. `workspace` allows 27 warnings.

### Documentation site

```sh
cd clients/docs
npm ci
npm run build:testing    # dev branch
npm run build:staging    # uat branch
npm run build:production # main branch
```

`postbuild` runs `pagefind --site .next/server/app --output-path out/_pagefind` to build the search index.

### Desktop app (Tauri)

```sh
cd clients/web-apps/apps/desktop-app
npm install
npm run dev       # Vite port 2999
npm run tauri     # Tauri CLI wrapper
npm run build     # tsc -b && vite build
```

The Tauri shell is in `src-tauri/`. The desktop app can also run in a plain browser; Tauri `invoke()` calls are guarded so they do not crash outside the Tauri shell.

### Runner app

```sh
# Build all RunnerApp targets
dotnet build clients/RunnerApp/RunnerApp.slnx

# Publish a platform target (examples from project directories)
bash clients/RunnerApp/RunnerApp.Linux/publish-ci.sh
```

### Tests

There is no xUnit/NUnit test suite. Verification is a mix of:

- **API-level**: Bruno collection in `tests/bruno/` (open in Bruno; environments are under `tests/bruno/environments/`).
- **.NET harnesses**: two custom console test runners:
  - `shared/ExecutorLibrary.Tests` — manual harness for `FlowProcessor` / `DynamicJson` / `NodeArgumentHelper`.
  - `tests/NodeLibrary.WindowsInterop.Tests` — interactive Windows interop harness (real mouse/keyboard APIs).

Run the .NET harnesses as normal console apps:

```sh
# ExecutorLibrary test harness
dotnet run --project shared/ExecutorLibrary.Tests

# Windows interop test harness (Windows only, net8.0-windows)
dotnet run --project tests/NodeLibrary.WindowsInterop.Tests
```

The interop harness is interactive by default. Pass `A` to run all, or a number to run a single test:

```sh
dotnet run --project tests/NodeLibrary.WindowsInterop.Tests -- 3
```

### Docker

Build images from the repo root after building the web apps:

```sh
# Nginx frontend (expects accounts, workspace, and studio dist already built)
sudo docker build -f deploy/nginx/Dockerfile -t acr.aventisia.com/avplatform/frontend:<tag> .

# Legacy .NET APIs
sudo docker build -f apis/WorcBackend-legacy/AccountsAPIs/Dockerfile -t acr.aventisia.com/avplatform/accounts-apis:<tag> .
sudo docker build -f apis/WorcBackend-legacy/WorkspaceAPIs/Dockerfile -t acr.aventisia.com/avplatform/workspace-apis:<tag> .

# LLM Pipeline
sudo docker build -f apis/llmpipeline/Dockerfile -t acr.aventisia.com/avplatform/llmpipeline-apis:<tag> apis/llmpipeline
```

## High-level architecture

### Monorepo boundaries

| Area | Path | Build entry | Notes |
|------|------|-------------|-------|
| Legacy .NET APIs | `apis/WorcBackend-legacy/` | `Avplatform.sln` | AccountsAPIs (4000) + WorkspaceAPIs (4001), both reference `AspNetToolkit` |
| Shared .NET libs | `shared/NodeLibrary/`, `shared/ExecutorLibrary/`, `shared/NodeToJson/` | `Avplatform.sln` | Referenced by WorkspaceAPIs and RunnerApp |
| Python API | `apis/llmpipeline/` | `app/main.py` | FastAPI on 4003, root path `/api` |
| Java integration | `apis/apache-camel/` | Maven (`./mvnw spring-boot:run`) | Camel/Spring Boot service |
| Web apps | `clients/web-apps/` | npm + Turborepo | accounts (3001), workspace (3002), studio (3006), atlas, shared packages |
| Docs | `clients/docs/` | Next.js | port 3004, search via pagefind |
| Desktop app | `clients/web-apps/apps/desktop-app/` | Vite + Tauri | port 2999; runner provisioning + UI shell |
| Runner app | `clients/RunnerApp/` | `RunnerApp.slnx` | .NET 8 autonomous flow runner (Win/Linux/macOS) |
| UI Inspector | `clients/UIInspector/` | `UIInspector.sln` | Windows UI Automation inspector (WPF / net48) |
| API tests | `tests/bruno/` | Bruno | Manual API test collections |
| Reverse proxy | `deploy/nginx/` | Dockerfile | Serves built studio/accounts/workspace dist; upstreams APIs |

### Frontend architecture

`clients/web-apps` is a Turborepo + npm workspaces repo. Shared packages live under `packages/` and are consumed via `*` workspace versions:

- `@avplatform/ui` — shared React components and utilities.
- `@avplatform/layout` — layout primitives.
- `@avplatform/tauri-utils` — Tauri integration helpers.
- `@avplatform/ui-editors` — editor components.
- `@avplatform/vite-config`, `@avplatform/typescript-config`, `@avplatform/eslint-config`, `@avplatform/tailwind-config` — build/config packages.

Shared packages are source-only TypeScript; there is no separate build step. Apps import the raw TypeScript and build through Vite.

`studio` and `workspace` are the heaviest apps; they use `@xyflow/react` for the flow builder and `@assistant-ui/*` for AI chat surfaces. `accounts` is the identity/subscription management app. `desktop-app` is a thin Tauri shell that provisions and launches the Runner app.

### Flow execution stack

The core automation engine is split across shared libraries and the desktop/Runner app:

- **`NodeLibrary.Core`** — node definitions (`Nodes/**/*.cs`), metadata attributes, base node classes (`BaseNode`, `NodeArgument`, `NodeContext`), and platform abstractions.
- **`NodeLibrary.Windows`** — Windows-specific interop (UIA, SendInput, screenshots).
- **`ExecutorLibrary`** — flow graph execution (`FlowProcessor`), `DynamicJson`/template resolution, `NodeArgumentHelper`, and ReactFlow data models. It consumes node definitions from `NodeLibrary.Core`.
- **`RunnerApp.Core`** — orchestrates local flow execution: `RunnerAppService`, `DesktopExecutionEngine`, `BackendFlowGraphProvider`, `OrchestratorHubClient`, and worker-process management.
- **`RunnerApp.{Windows,Linux,macOS}`** — platform headless/console executables.

WorkspaceAPIs stores and serves flow graphs. The Runner app downloads a graph and runs it locally via the ExecutorLibrary, reporting progress back to the backend through a SignalR/WebSocket orchestrator hub.

### API boundaries

- **AccountsAPIs** — identity, users, roles, subscriptions, billing, organizations, platform-application scoping.
- **WorkspaceAPIs** — flows, nodes, executions, machines, credentials, scheduler jobs, file storage, AI/LLM connector orchestration.
- **LLMPipeline** — text/OCR/LLM/STT/TTS, vector stores, custom tools, PDF conversion. Called by WorkspaceAPIs for AI-heavy work.
- **Apache Camel** — enterprise integration routes; called by WorkspaceAPIs for connectors.

Both .NET APIs use EF Core 8 with PostgreSQL (`Npgsql.EntityFrameworkCore.PostgreSQL`), Identity for accounts, Quartz for scheduled jobs, and Serilog for logging.

### CI/CD

Jenkins stages are branch-aware:

- `dev` → `avdev.aventisia.com`
- `uat` → `avuat.aventisia.com`
- `main` → `avweb1.aventisia.com`, `avweb2.aventisia.com`

Manual build parameter `REPOS_TO_BUILD` accepts: `accounts_api`, `workspace_api`, `llmpipeline_api`, `apachecamel_api`, `docs`, `web_apps`, `runner_app`. `web_apps` covers accounts, workspace, studio, and atlas (desktop-app excluded).

Node build modes by branch:

- `dev` → `testing`
- `uat` → `staging`
- `main` → `production`

## Important conventions and gotchas

- **Warnings as errors**: `AccountsAPIs` and `AspNetToolkit` set `TreatWarningsAsErrors=true`. `WorkspaceAPIs` only suppresses nullable hints (`NoWarn` CS8602;NU1701). The local .NET 10 SDK sometimes skips CS1998 that the Jenkins .NET 8 SDK raises — scan async-without-await before trusting a local build.
- **AspNetToolkit rebuild cascade**: Because both APIs reference it, any change to `apis/WorcBackend-legacy/AspNetToolkit` must be followed by rebuilding both APIs.
- **EF Core migrations**: Require the design-time factory plus `~/.dotnet/tools/dotnet-ef`. The `AccountRole` entity uses `[Table("Roles")]`, but the actual table is `AspNetRoles` (the attribute is inert; Identity owns the table name).
- **ServiceResponse pattern**: Legacy API controllers/services return `ServiceResponse<T>`. Controllers omit the `Async` suffix; service interfaces and implementations include it. Delete-multiple endpoints return the count of records deleted.
- **Frontend API conventions** (detailed in `clients/web-apps/AGENTS.md`): API files use `.apis.ts`, DTOs use `.dto.ts` (and must be `interface`, not `type`), methods mirror backend controller order, and responses are parsed as `{ success, message, data }` envelopes. Prefer Zod for validation.
- **Backend conventions** (detailed in `apis/WorcBackend-legacy/AGENTS.md`): Feature folders under `Features/<FeatureName>/` with `Controllers`, `Services`, `DTOs`, `Entities`, etc. Keep helper logic inside feature `Helpers/` unless reused across features.
- **Environment files**: `.env.local` is gitignored. `deploy/.env` contains example/default values. Do not commit secrets.
- **Versioning**: The Desktop app and Runner app share a version sourced from the latest git tag (`v<X.Y.Z>`). Run `scripts/release-version.sh` (Linux/macOS) or `scripts/release-version.ps1` (Windows) to propagate the version into `.csproj`, `Cargo.toml`, `tauri.conf.json`, and `package.json`. The Tauri build script calls this automatically.

## Where to look next

- Per-area conventions: `apis/WorcBackend-legacy/AGENTS.md`, `clients/web-apps/AGENTS.md`
- Full setup and Docker commands: `README.md`
- VS Code launch tasks: `.vscode/tasks.json`
- Jenkins pipeline: `Jenkinsfile`
