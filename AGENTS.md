# Agent Notes for avplatform

Compact, repo-specific guidance for OpenCode sessions. If a fact is obvious from filenames or the README, it is omitted.

## Repository shape

- Polyglot monorepo with one active .NET API generation, Python/FastAPI service, React frontends, shared Node libraries, and an nginx deployment layer.
- Active branches: `dev`, `uat`, `main`.
- CI/CD: Jenkins (root `Jenkinsfile`). No GitHub Actions or pre-commit hooks.

## Solution / project boundaries

| Area              | Path                                                                   | Entry / build                   | Notes                                                                                |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------ |
| .NET APIs         | `apis/WorcBackend-legacy/`                                             | `Avplatform.sln`                | AccountsAPIs (port 4000) + WorkspaceAPIs (port 4001), both reference `AspNetToolkit` |
| Shared libs       | `shared/NodeLibrary/`, `shared/ExecutorLibrary/`, `shared/NodeToJson/` | .NET 8 class libs / console app | Referenced by WorkspaceAPIs and NodeExecutor tools                                   |
| Python API        | `apis/llmpipeline/`                                                    | `app/main.py`                   | FastAPI on port 4003, root path `/api`                                               |
| Web apps          | `clients/web-apps/`                                                    | npm workspaces + Turborepo      | `apps/accounts` (3001), `apps/workspace` (3002), shared packages under `packages/`   |
| Studio app        | `clients/web-apps/apps/studio/`                                        | Turborepo app (Vite)            | port 3006                                                                            |
| Documentation     | `clients/docs/`                                                        | Next.js, port 3004              | Search index built by `pagefind` in `postbuild`                                      |
| Desktop app       | `clients/desktop-app/`                                                 | Vite + Tauri (Rust)             | dev port 2999, Tauri config in `src-tauri/`                                          |
| Node/RPA executor | `clients/NodeExecutor/`                                                | Multiple `.sln` files           | Windows-centric tooling (desktop RPA executor)                                       |
| API tests         | `tests/bruno/`                                                         | Bruno collection                | AccountsAPIs, WorkspaceAPIs, llmpipeline APIs                                        |
| Reverse proxy     | `deploy/nginx/`                                                        | Dockerfile                      | Serves built studio dist; backend upstream via nginx config                          |

## Exact developer commands

### .NET APIs

```sh
# Build all APIs
dotnet build Avplatform.sln

# Run a single API
dotnet run --project apis/WorcBackend-legacy/AccountsAPIs
dotnet run --project apis/WorcBackend-legacy/WorkspaceAPIs

# Build/publish single API (Release)
dotnet build -c Release apis/WorcBackend-legacy/AccountsAPIs
dotnet publish -c Release --property:PublishDir=./Published apis/WorcBackend-legacy/AccountsAPIs

# Migrate EF Core database (AccountsAPIs)
export ASPNETCORE_ENVIRONMENT=Localhost # To load .env.local values for connection string
dotnet ef migrations add <MigrationName> -o Data/Migrations --project apis/WorcBackend-legacy/AccountsAPIs --context=AccountsDbContext
dotnet ef database update --project apis/WorcBackend-legacy/AccountsAPIs --context=AccountsDbContext

# Migrate EF Core database (WorkspaceAPIs)
export ASPNETCORE_ENVIRONMENT=Localhost # To load .env.local values for connection string
dotnet ef migrations add <MigrationName> -o Data/Migrations --project apis/WorcBackend-legacy/WorkspaceAPIs --context=WorkspaceDbContext
dotnet ef database update --project apis/WorcBackend-legacy/WorkspaceAPIs --context=WorkspaceDbContext
```

If `AspNetToolkit` changes, both APIs must be rebuilt (Jenkins enforces this dependency).

### Python LLM Pipeline API

```sh
cd apis/llmpipeline
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Local dev run
ENV=local ./venv/bin/uvicorn app.main:app --port 4003 --reload
```

Uses pydantic-settings. `ENV=local` loads `.env` and `.env.local`.

### Web apps (`clients/web-apps`)

```sh
cd clients/web-apps
npm install          # uses npm@10.9.3, installs all workspace deps

npm run dev          # turbo runs all app dev servers
npm run build        # type-check + build all apps
npm run typecheck    # turbo typecheck across workspaces
npm run lint         # turbo lint across workspaces
npm run format       # prettier all source files
npm run pregit       # format + eslint --fix + tsc -b (ready-to-commit)
```

Run a single app:

```sh
npx turbo run dev --filter=accounts
npx turbo run dev --filter=workspace
```

Shared packages (`@avplatform/ui`, `@avplatform/vite-config`, etc.) are source-only TypeScript — no separate build step.

### Studio app

```sh
npx turbo run dev --filter=studio   # port 3006
npx turbo run build --filter=studio
npx turbo run lint --filter=studio
```

Studio depends on external package `@aventisia/ui`, not the local `@avplatform/*` packages.

### Docs

```sh
cd clients/docs
npm ci
npm run build:testing    # dev branch build mode in Jenkins
npm run build:staging    # uat branch build mode
npm run build:production # main branch build mode
```

`postbuild` runs `pagefind --site .next/server/app --output-path out/_pagefind`.

### Desktop app

```sh
cd clients/desktop-app
npm install
npm run dev      # Vite port 2999
npm run tauri    # Tauri CLI wrapper
npm run build    # tsc -b && vite build
```

### Bruno API tests

Open `tests/bruno` in Bruno. Environments are under `tests/bruno/environments/`.

## Important conventions and gotchas

- `pregit` scripts exist in most JS packages and root web-apps: they run formatting, lint fix, and typecheck. Prefer `npm run pregit` before committing.
- `turbo.json` order/dependencies:
  - `lint` depends on `^build` — run builds before linting will succeed at turbo level.
  - `build` depends on `^build`.
  - `typecheck` depends on `^typecheck`.
- `clients/web-apps/packages/layout` is named `@avplatform/layout` alongside other `@avplatform/*` packages.
- Both web apps (`accounts` and `workspace`) use `--max-warnings 0` for lint.
- Area-specific coding conventions are documented in sub-project `AGENTS.md` files:
  - `apis/WorcBackend-legacy/AGENTS.md` — ASP.NET API conventions (CRUD naming, ServiceResponse patterns, DTO/Entity alignment).
  - `clients/web-apps/AGENTS.md` — React frontend + ASP.NET integration conventions (`.apis.ts`, DTOs, file suffixes, Zod validation).
- Docker images:
  - .NET API Dockerfiles expect project root as build context and copy `AspNetToolkit` alongside.
  - Nginx Dockerfile copies the built studio dist (`clients/web-apps/apps/studio/dist`) into the image — build it first.
  - LLMPipeline Dockerfile uses `python:3.12-slim`, port 4003.
- Environment files: `.env.local` is gitignored. `deploy/.env` contains example/default values for local/dev. Do not commit secrets.
- No unit test suites found in web-apps or .NET projects. `tests/bruno` is the primary API-level verification.
- EF Core migrations live under `Data/Migrations` in each legacy API project.
- NodeExecutor / RPA tools are Windows-oriented; expect `.csproj`, WPF-style projects, and `src-tauri` only for the desktop app.

## CI/CD quick reference

Jenkins stages are branch-aware:

- `dev` → deploy to `avdev.aventisia.com`
- `uat` → deploy to `avuat.aventisia.com`
- `main` → deploy to `avweb1.aventisia.com`, `avweb2.aventisia.com`

Build modes for Node apps:

- `dev` → `testing`
- `uat` → `staging`
- `main` → `production`

Manual build parameter `REPOS_TO_BUILD` accepts: `accounts_api`, `workspace_api`, `llmpipeline_api`, `docs`, `web_apps`, `runner_app`.

## Verified tool versions

Available in the dev environment:

- .NET SDK 8.0.129
- Node 22.18.0 / npm 10.9.3
- Python 3.12.3
