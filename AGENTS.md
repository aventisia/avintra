# Agent Notes for avplatform

Compact, repo-specific guidance for OpenCode sessions. If a fact is obvious from filenames or the README, it is omitted.

## Repository shape

- Polyglot monorepo: .NET APIs, Python/FastAPI, Java/Spring Boot, Node/TypeScript services, React frontends, shared .NET libraries, and an nginx deployment layer.
- Active branches: `uat`, `main`. Feature PRs branch from `origin/main` but target `uat`.
- CI/CD: Jenkins (root `Jenkinsfile`). No GitHub Actions or pre-commit hooks.
- The README's "new platform" commands (`dotnet run --project apis/WorcBackend/...`) are stale: `apis/WorcBackend/` does not exist. The active backend is `apis/WorcBackend-legacy/`.

## Documentation and Code Style Boundaries

Strict, non-negotiable rules for all code and documentation produced in this repository.

1. **BAN ON IMPLEMENTATION COMMENTS:** Do not generate inline comments to explain syntax or internal logic. Code must be self-documenting through precise variable and method naming.
2. **STRICT API DOCUMENTATION:** Only write JSDoc or XML documentation for exported interfaces, public APIs, and complex type definitions, and keep every summary to one short sentence that states the contract, never the implementation. Internal functions must remain undocumented.
3. **INLINE EXCEPTIONS:** The only permitted inline comments are brief warnings about external system constraints, race conditions, or required hacks (e.g. specific delay timings for database locks). Prefix each with `IMPORTANT NOTE:`.
4. **PROGRESSIVE DISCLOSURE:** Before modifying any feature, read its local `README.md` (when present) for domain-specific architectural boundaries and exceptions. Do not create feature READMEs proactively; add one only when a feature has non-obvious boundaries worth documenting.

## Solution / project boundaries

| Area              | Path                                                                   | Entry / build                   | Notes                                                                                |
| ----------------- | ---------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------ |
| .NET APIs         | `apis/WorcBackend-legacy/`                                             | `Avplatform.sln`                | AccountsAPIs (4000) + WorkspaceAPIs (4001), both reference `AspNetToolkit`            |
| Shared .NET libs  | `shared/NodeLibrary/`, `shared/ExecutorLibrary/`, `shared/NodeToJson/` | `Avplatform.sln`                | Referenced by WorkspaceAPIs and RunnerApp; flow-graph execution lives in `ExecutorLibrary` |
| Python API        | `apis/llmpipeline/`                                                    | `app/main.py`                   | FastAPI on 4003, root path `/api`                                                    |
| Java API          | `apis/apache-camel/`                                                   | Maven (`pom.xml`, `./mvnw`)     | Spring Boot connector harness on 4005                                                |
| Node sidecar      | `apis/corsair/`                                                        | `src/main.ts` (tsx)             | Internal-only OAuth/plugin sidecar on 4006; own README is authoritative              |
| Web apps          | `clients/web-apps/`                                                    | npm workspaces + Turborepo      | `apps/accounts` (3001), `workspace` (3002), `studio` (3006), `atlas` (3007)          |
| Documentation     | `clients/docs/`                                                        | Next.js, port 3004              | Search index built by `pagefind` in `postbuild`                                      |
| Desktop app       | `clients/web-apps/apps/desktop-app/`                                   | Vite + Tauri (Rust)             | dev port 2999, Tauri config in `src-tauri/`, launches RunnerApp + UIInspector        |
| Runner app        | `clients/RunnerApp/`                                                   | `RunnerApp.slnx`                | .NET 8 autonomous flow runner (Windows / Linux / macOS)                              |
| UI Inspector      | `clients/UIInspector/`                                                 | `UIInspector.sln`               | Windows UI Automation inspector (WPF / net48)                                        |
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

If `AspNetToolkit` changes, both APIs must be rebuilt (Jenkins enforces this dependency). Migrations also require the design-time factory and `~/.dotnet/tools/dotnet-ef`.

### .NET test harnesses and RunnerApp

There is no xUnit/NUnit suite. Two custom console harnesses cover .NET logic:

```sh
dotnet run --project shared/ExecutorLibrary.Tests          # FlowProcessor / DynamicJson / NodeArgumentHelper
dotnet run --project tests/NodeLibrary.WindowsInterop.Tests # Windows-only, interactive (pass A or a test number)
```

```sh
dotnet build clients/RunnerApp/RunnerApp.slnx              # all RunnerApp targets
bash clients/RunnerApp/RunnerApp.Linux/publish-ci.sh       # publish one platform target
```

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

### Corsair sidecar (`apis/corsair`)

```sh
cd apis/corsair
npm install --legacy-peer-deps   # peer conflict: @corsair-dev/onepassword pins a conflicting zod (CI uses npm ci --force)
npm run dev                      # predev runs migrate + generate:configs
npm test                         # generator + validation harnesses
npm run typecheck
```

- `npm start` runs `tsx src/main.ts` (a devDependency). In production use `npm run start:prod` (`node dist/main.js`).
- `generate:configs` and `seed:tools` are intentionally NOT in `prestart`; Jenkins runs them as explicit stages. `seed:tools` writes the Workspace DB (`ws_Tools`), so it must run after that DB is migrated.
- `npm run plugins:onboard -- <plugin-id>` requires the `--`, otherwise npm swallows the flags.

### Apache Camel API

```sh
cd apis/apache-camel
./mvnw spring-boot:run     # port 4005
```

### Web apps (`clients/web-apps`)

```sh
cd clients/web-apps
npm install          # packageManager is npm@10.9.3

npm run dev          # turbo runs all app dev servers
npm run build        # type-check + build all apps
npm run typecheck    # turbo typecheck across workspaces
npm run lint         # turbo lint across workspaces
npm run format       # prettier all source files
npm run pregit       # prettier + eslint --fix + tsc -b (ready-to-commit)
```

Run a single app:

```sh
npx turbo run dev --filter=accounts    # 3001
npx turbo run dev --filter=workspace   # 3002
npx turbo run dev --filter=studio      # 3006
npx turbo run dev --filter=atlas       # 3007
```

Shared packages (`@avplatform/ui`, `@avplatform/vite-config`, etc.) are source-only TypeScript — no separate build step. Per-app `pregit` only runs `tsc -b` + prettier, not eslint.

### Studio app

`apps/studio` is a Turborepo app (port 3006). Its shared UI package is `@avplatform/ui`; the external `@aventisia/ui` is NOT a dependency.

### Docs

```sh
cd clients/docs
npm ci
npm run build:staging    # uat branch build mode
npm run build:production # main branch build mode
```

`postbuild` runs `pagefind --site .next/server/app --output-path out/_pagefind`.

### Desktop app

```sh
cd clients/web-apps/apps/desktop-app
npm install
npm run dev      # Vite port 2999
npm run tauri    # Tauri CLI wrapper
npm run build    # tsc -b && vite build
```

Tauri `invoke()` calls are guarded by a Tauri-detection check so the app also runs in a plain browser.

### Docker

Build from the repo root after building web apps. Dockerfiles exist for each service; documented builds:

```sh
sudo docker build -f deploy/nginx/Dockerfile -t <tag> .                                  # needs accounts/workspace/studio dist built
sudo docker build -f apis/WorcBackend-legacy/AccountsAPIs/Dockerfile -t <tag> .
sudo docker build -f apis/WorcBackend-legacy/WorkspaceAPIs/Dockerfile -t <tag> .
cd apis/llmpipeline && sudo docker build -t <tag> . && cd ../..
```

### Bruno API tests

Open `tests/bruno` in Bruno. Environments are under `tests/bruno/environments/`.

## Important conventions and gotchas

- `pregit` scripts exist in most JS packages and root web-apps; prefer `npm run pregit` before committing.
- `turbo.json` dependency order: `lint` depends on `^build`, `build` depends on `^build`, `typecheck` depends on `^typecheck`. Linting alone fails without prior builds.
- Lint warning budgets: `accounts`, `studio`, `atlas`, `desktop-app` use `--max-warnings 0`; `workspace` allows 27 warnings.
- `clients/web-apps/packages/layout` is named `@avplatform/layout` alongside other `@avplatform/*` packages.
- Warnings as errors: `AccountsAPIs` and `AspNetToolkit` set `TreatWarningsAsErrors=true`; `WorkspaceAPIs` only suppresses `CS8602;NU1701`. CI builds with the .NET 8 SDK while local dev has the .NET 10 SDK, which sometimes skips `CS1998` (async without await) that Jenkins will fail on — scan before trusting a local build.
- EF Core: `AccountRole` carries `[Table("Roles")]`, but Identity owns the real table name `AspNetRoles`; the attribute is inert.
- `ServiceResponse<T>` pattern: controllers omit the `Async` suffix, service interfaces/implementations include it, and `delete-multiple` endpoints return a count (`ServiceResponse<int>`), not a boolean. Details in `apis/WorcBackend-legacy/AGENTS.md`.
- Frontend API files use `.apis.ts`, DTOs use `.dto.ts` (must be `interface`), methods mirror backend controller order, and responses are `{ success, message, data }` envelopes. Details in `clients/web-apps/AGENTS.md`.
- Versioning: the Desktop app and Runner app share a version from the latest git tag (`v<X.Y.Z>`). Run `scripts/release-version.sh` (or `.ps1`) to propagate it into `.csproj`, `Cargo.toml`, `tauri.conf.json`, and `package.json`. No tag means the script errors unless you pass an explicit version.
- Environment files: `.env.local` is gitignored; `deploy/.env` holds example values. Do not commit secrets.
- No unit test suites in web-apps or the .NET projects; `tests/bruno`, the two console harnesses, and Corsair's `npm test` are the verification paths.
- Area-specific conventions: `apis/WorcBackend-legacy/AGENTS.md` (ASP.NET CRUD/layering) and `clients/web-apps/AGENTS.md` (React + ASP.NET integration, file suffixes, Zod).

## CI/CD quick reference

Jenkins stages are branch-aware:

- `uat` → deploy to `avuat.aventisia.com`
- `main` → deploy to `avweb1.aventisia.com`

Build modes for Node apps: `uat` → `staging`, `main` → `production`.

Manual build parameter `REPOS_TO_BUILD` accepts: `accounts_api`, `workspace_api`, `llmpipeline_api`, `apachecamel_api`, `corsair_api`, `docs`, `web_apps`, `runner_app`. `web_apps` covers accounts, workspace, studio, and atlas (desktop-app excluded).

## Issue workflow

Gitea-driven, `tea`-CLI, staged skills live in `.agents/skills/`: `scout` → `architect` → `build` → `audit`. Intermediate artifacts are written under `local-issues/<issue-number>/`.

Each stage runs in its own fresh session using a different model from the preceding stage. The stage agent must complete its artifact/report, name the next skill and model role when another stage is required, then stop. It must not load/invoke the next skill or continue into another stage. The human starts each subsequent stage in a new session and selects the different model. An Auditor `CLEAR` result is terminal. Apply the same session boundary to every rework cycle after an audit finding.

Use one file per workflow stage and round:

```text
local-issues/<issue-number>/s1-scout-report.md
local-issues/<issue-number>/s2-architect-plan-r<N>.md
local-issues/<issue-number>/s3-build-report-r<N>.md
local-issues/<issue-number>/s4-audit-report-r<N>.md
```

A round is one Architect → Builder → Auditor cycle. Start with `r1`; only a `NEEDS_REWORK` audit at `rN` starts the next cycle at `rN+1`. All three round files use the same number. The build report contains its slices, progress, validation, and final summary. Never combine rounds or overwrite a completed round; resume only an incomplete artifact for that same round. Existing unnumbered artifacts (`01-scout-report.md`, `02-architect-plan.md`, `03-heavy-typist-slices.md`, `04-audit-report.md`) are read-only legacy context and must not be renamed, deleted, or overwritten. If no numbered round exists, the first new round is `r1`.

## Toolchain versions

- Local dev: .NET SDK 10.0.401 (projects target `net8.0`), Node 24.12.0, Python 3.12.3.
- Jenkins/CI builds the .NET APIs with the .NET 8 SDK; web-apps pin npm via `packageManager: npm@10.9.3`.

## Reporting

- When reporting information to me, be extremely concise and sacrifice grammar for the sake of concision.
