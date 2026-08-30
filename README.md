# Aventisia WORC Platform Monorepo

This repository contains the source code, shared libraries, clients, and deployment configuration for the **Aventisia WORC Platform** — an automation, AI, and workflow orchestration platform.

## Repository Structure

```
.
├── apis/                       # Backend APIs and services
│   ├── WorcBackend/            # New .NET 8 solution (Accounts.API, Worc.API, Domain, Infrastructure, Shared)
│   ├── WorcBackend-legacy/     # Legacy .NET 8 backend (AccountsAPIs, WorkspaceAPIs, AspNetToolkit)
│   └── llmpipeline/            # FastAPI Python service for text extraction, OCR, LLM pipelines
│
├── clients/                    # Frontend and desktop applications
│   ├── web-apps/               # Turborepo + npm workspaces (Vite + React + TypeScript)
│   │   ├── apps/accounts       # Identity / accounts web app
│   │   ├── apps/workspace      # Workspace / flow builder web app
│   │   ├── apps/studio         # Studio / admin web app
│   │   └── packages/*          # Shared packages (ui, layout, ui-editors, eslint-config, etc.)
│   ├── desktop-app/            # Tauri-based cross-platform desktop app
│   ├── docs/                   # Nextra-based documentation site
│   └── NodeExecutor/           # Windows desktop workflow executor (WPF / .NET Framework 4.8)
│
├── shared/                     # Shared cross-platform .NET libraries
│   ├── ExecutorLibrary/        # Flow execution engine
│   ├── NodeLibrary/            # Node definitions and execution strategies
│   └── NodeToJson/             # Node-to-JSON conversion utility
│
├── tests/                      # Test collections
│   └── bruno/                  # Bruno API test collections
│
└── deploy/                     # Deployment assets
    └── nginx/                  # Nginx reverse proxy / static file server
```

## Quick Start

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/) with npm
- [Python 3.12+](https://www.python.org/) (for `llmpipeline`)
- [Docker](https://www.docker.com/) (for containerized builds)

### Running Local Development

```sh
# Web apps monorepo
npm --prefix clients/web-apps install
npm --prefix clients/web-apps run dev

# New .NET backend
dotnet run --project apis/WorcBackend/Accounts.API
dotnet run --project apis/WorcBackend/Worc.API

# Legacy .NET backend
dotnet run --project apis/WorcBackend-legacy/AccountsAPIs
dotnet run --project apis/WorcBackend-legacy/WorkspaceAPIs

# LLM Pipeline Python API
cd apis/llmpipeline
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

> See the individual `README.md` files inside each top-level directory for detailed setup, build, and run instructions.

## Docker Build & Push

Login to the private registry if needed:

```sh
sudo docker login acr.aventisia.com
```

### 1. Install and build legacy web clients

```sh
npm --prefix clients/web-apps/apps/accounts install
npm --prefix clients/web-apps/apps/workspace install
# Studio is now part of the web-apps turborepo (see clients/web-apps/README.md)
npm --prefix clients/web-apps install

npm --prefix clients/web-apps/apps/accounts run build --mode=production
npm --prefix clients/web-apps/apps/workspace run build --mode=production
npx --prefix clients/web-apps turbo run build --filter=studio -- --mode=production
```

### 2. Build Docker images from the repository root

```sh
# Nginx frontend
sudo docker build -f deploy/nginx/Dockerfile -t acr.aventisia.com/avplatform/frontend:0.4.0 .

# Legacy .NET APIs
sudo docker build -f apis/WorcBackend-legacy/AccountsAPIs/Dockerfile -t acr.aventisia.com/avplatform/accounts-apis:0.1.0 .
sudo docker build -f apis/WorcBackend-legacy/WorkspaceAPIs/Dockerfile -t acr.aventisia.com/avplatform/workspace-apis:0.1.0 .

# LLM Pipeline
cd apis/llmpipeline && sudo docker build -t acr.aventisia.com/avplatform/llmpipeline-apis:0.1.0 . && cd ../..
```

### 3. Push images

```sh
sudo docker push acr.aventisia.com/avplatform/frontend:0.4.0
sudo docker push acr.aventisia.com/avplatform/accounts-apis:0.1.0
sudo docker push acr.aventisia.com/avplatform/workspace-apis:0.1.0
sudo docker push acr.aventisia.com/avplatform/llmpipeline-apis:0.1.0
```

## Retag and Push to Azure Container Registry

When images are stable in `acr.aventisia.com`, retag and push them to `aventisiaacr.azurecr.io` for on-premises / production deployments:

```sh
sudo docker tag acr.aventisia.com/avplatform/frontend:0.4.0 aventisiaacr.azurecr.io/avplatform/frontend:0.4.0
sudo docker tag acr.aventisia.com/avplatform/accounts-apis:0.1.0 aventisiaacr.azurecr.io/avplatform/accounts-apis:0.1.0
sudo docker tag acr.aventisia.com/avplatform/workspace-apis:0.1.0 aventisiaacr.azurecr.io/avplatform/workspace-apis:0.1.0
sudo docker tag acr.aventisia.com/avplatform/llmpipeline-apis:0.1.0 aventisiaacr.azurecr.io/avplatform/llmpipeline-apis:0.1.0

sudo docker login aventisiaacr.azurecr.io -u internal-pushpull-token -p <acr_token_password>

sudo docker push aventisiaacr.azurecr.io/avplatform/frontend:0.4.0
sudo docker push aventisiaacr.azurecr.io/avplatform/accounts-apis:0.1.0
sudo docker push aventisiaacr.azurecr.io/avplatform/workspace-apis:0.1.0
sudo docker push aventisiaacr.azurecr.io/avplatform/llmpipeline-apis:0.1.0
```

## Network Setup

```sh
sudo docker network create avplatform-net
```

## Documentation

- Project overview and per-service instructions are available in each directory's `README.md`.
- API test collections are located under `tests/bruno/` and can be opened with [Bruno](https://www.usebruno.com/).
- Product documentation is built from `clients/docs/` using [Nextra](https://nextra.site/).

## Versioning

The **Desktop app** and **Runner app** share a single version, sourced from the latest **git tag** (`v<X.Y.Z>`, e.g. `v0.1.86`). The version is written into the files that need a literal string at build time by `scripts/release-version.sh` (Linux/macOS) or `scripts/release-version.ps1` (Windows).

```sh
# Resolve the version from the latest git tag and write it everywhere
./scripts/release-version.sh            # Linux/macOS
.\scripts\release-version.ps1           # Windows

# Override with an explicit version
./scripts/release-version.sh 0.2.0
.\scripts\release-version.ps1 0.2.0

# Print the resolved version only
./scripts/release-version.sh --show
```

The script updates:

- `clients/RunnerApp/RunnerApp.Windows/RunnerApp.Windows.csproj` — `<Version>` + `<InformationalVersion>` (source of truth for publish scripts)
- `clients/RunnerApp/RunnerApp.Linux/RunnerApp.Linux.csproj` — `<Version>` + `<InformationalVersion>`
- `clients/RunnerApp/RunnerApp.macOS/RunnerApp.macOS.csproj` — `<Version>` + `<InformationalVersion>`
- `clients/web-apps/apps/desktop-app/src-tauri/Cargo.toml` — `version`
- `clients/web-apps/apps/desktop-app/src-tauri/Cargo.lock` — the `app` package entry
- `clients/web-apps/apps/desktop-app/src-tauri/tauri.conf.json` — `version` + `userAgent`
- `clients/web-apps/apps/desktop-app/package.json` — `version`

The Tauri build (`01-tauri-build.bat`) runs the release script automatically before `npx tauri build`. The RunnerApp `publish.sh` already reads `<Version>` from the `.csproj` to name its artifact. The same tag is intended to tag future self-hosted Docker images.

### Usage going forward

The version is driven by git tags — you never edit the version strings by hand. To cut a new release:

```sh
# 1. Create a release tag (Desktop + Runner share this version)
git tag v0.1.87

# 2. Write the version into all target files
./scripts/release-version.sh            # Linux/macOS
.\scripts\release-version.ps1           # Windows

# 3. Build the Desktop app (runs the release script automatically)
#    Windows: run clients/web-apps/apps/desktop-app/01-tauri-build.bat

# 4. Build/publish the Runner app (reads <Version> from the .csproj)
bash clients/RunnerApp/publish.sh       # produces AvintraRunnerService_<ver>_win-x64.zip

# 5. Push the tag so CI and other developers see it
git push origin v0.1.87
```

**Release checklist:**

1. **Tag first** — the tag is the single source of truth. Use `v<X.Y.Z>` (e.g. `v0.1.87`).
2. **Run the release script** — it writes the version into `RunnerApp.Windows.csproj` (and `RunnerApp.Linux.csproj` / `RunnerApp.macOS.csproj`), `Cargo.toml`, `Cargo.lock`, `tauri.conf.json`, and `desktop-app/package.json`.
3. **Build the Desktop app** — `01-tauri-build.bat` already calls the release script before `npx tauri build`, so this step is automatic.
4. **Publish the Runner app** — `publish.sh` derives the artifact name from `<Version>` in the `.csproj`.
5. **Push the tag** — so the version is recorded and CI can build from it.

> **Note:** if no tag exists yet, the release script errors and asks you to create one (or pass an explicit version, e.g. `./scripts/release-version.sh 0.1.87`).
