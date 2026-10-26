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
│   │   ├── apps/desktop-app    # Tauri-based cross-platform desktop app
│   │   └── packages/*          # Shared packages (ui, layout, ui-editors, eslint-config, etc.)
│   ├── RunnerApp/              # .NET 8 autonomous workflow runner (Windows / Linux / macOS)
│   ├── UIInspector/            # Windows UI Automation inspector (WPF / .NET Framework 4.8)
│   └── docs/                   # Nextra-based documentation site
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

## Custom HTTP Headers

The platform uses a set of custom `X-...` HTTP request/response headers to carry cross-cutting context
(app identity, tenant/space/env scoping, auth, client attribution, correlation, and streaming behavior)
between clients, the reverse proxy, and the backend services. This is the single reference for what each
header means and where it is set and read, so you don't have to grep across the .NET APIs, the Python LLM
Pipeline, nginx, Apache Camel, and the web apps.

> Scope: this table covers **platform-defined** custom headers only. Third-party provider headers
> (e.g. `X-GitHub-*`, `X-Hub-Signature-256`, `X-Razorpay-Signature`), reverse-proxy headers
> (`X-Forwarded-For`, `X-Forwarded-Proto`), and standard security headers
> (`Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, ...) are defined elsewhere and are **not** listed here.

| Header                                        | Direction | Purpose                                                                                                                                               | Set / read in                                                                                                                                                                                                                             |
| --------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `X-App-Context`                               | Request   | Identifies which frontend app (workspace, studio, etc.) the request comes from so role/app scoping applies.                                           | Set: `clients/web-apps/apps/workspace/react-toolkit/lib/axios-instance.ts`. Read: `apis/WorcBackend-legacy/AccountsAPIs/Helpers/PlatformAppHeaderUtil.cs`.                                                                                |
| `X-Space-Id`                                  | Request   | Space scoping for multi-space tenants. Omitted/"Central" for the central space.                                                                       | Resolve: `apis/WorcBackend-legacy/AspNetToolkit/Middleware/TenantResolver.cs`. Set: `*/src/utils/space-headers.ts` (workspace, studio), `clients/RunnerApp/RunnerApp.Core/BackendHttpClient.cs`.                                          |
| `X-Env-Type`                                  | Request   | Deployment env scoping (`dev`/`prod`) for config, vault/credential lookups, and LLM resource resolution.                                              | Resolve: `AspNetToolkit/Middleware/TenantResolver.cs`. Helper: `shared/NodeLibrary/NodeLibrary.Core/Helpers/NodeHttpHeaders.cs`.                                                                                                          |
| `X-TENANT-ID` / `X-Tenant-Id`                 | Request   | Tenant identification for SuperAdmin/API-key/webhook endpoints where no user JWT is present. Canonical spelling: `X-TENANT-ID`.                       | Read: `AspNetToolkit/Middleware/TenantResolver.cs`, `WorkspaceAPIs/Features/MachineAuth/Service/MachineAuthService.cs`, `WorkspaceAPIs/.../WebhookController.cs`. Set: `AccountsAPIs/.../ManageTenantService.cs`, `BackendHttpClient.cs`. |
| `X-API-KEY`                                   | Request   | API-key **internal** auth for machine/webhook-protected service endpoints.                                                                            | Read: `AspNetToolkit/Attributes/CustomAuthorizeAttribute.cs`, `WorkspaceAPIs/Attributes/ApiKeyAuthorizeAttribute.cs`. Set: `BackendHttpClient.cs`, Bruno collections.                                                                     |
| `X-Api-Key`                                   | Request   | API-key for **outbound connector/webhook** calls (Apache Camel cloud connectors and webhook-triggered flows). A different auth path than `X-API-KEY`. | Read/set: `apis/apache-camel/src/.../connectors/http/HttpConfigurer.java`, `WorkspaceAPIs/.../WebhookController.cs`.                                                                                                                      |
| `X-OnPrem-Tenant-Id`, `X-OnPrem-Instance-Key` | Request   | On-prem instance validation / metadata handshake for GlobalAdmin flows.                                                                               | Set: `AccountsAPIs/Setup/Services/InstanceService.cs`, `AspNetToolkit/Extensions/EnvironmentConfigurationExtension.cs`.                                                                                                                   |
| `X-Client-Type`, `X-Client-Version`           | Request   | Attribute job execution to the desktop client type/version (complements `User-Agent`). Only sent under Tauri (`IS_TAURI`).                            | Set: `clients/web-apps/packages/ui/src/lib/axios-instance.ts`. Read: `WorkspaceAPIs/Helpers/ClientContextResolver.cs`.                                                                                                                    |
| `X-Tenant-Scope`                              | Request   | Opts into tenant-less/"central" uploads of public files and templates (value `"Scope1"`).                                                             | Read: `AspNetToolkit/Services/Implementions/UploadFileService.cs`. Set: file-upload & template `.apis.ts` in studio/workspace.                                                                                                            |
| `X-Database-Name`                             | Request   | Tenant/database selection in the vector-store layer (LLM Pipeline only); required by `database.py`.                                                   | Read: `apis/llmpipeline/app/core/database.py`.                                                                                                                                                                                            |
| `X-Request-Id` / `x-request-id`               | Both      | Request correlation/tracing across the LLM Pipeline (echoed on responses; generated when absent).                                                     | `apis/llmpipeline/app/main.py`.                                                                                                                                                                                                           |
| `X-Job-Id`                                    | Response  | Correlates an SSE streaming response (LLM/STT/TTS) to a job.                                                                                          | Set: `apis/llmpipeline/app/features/{litellm,llm_providers,stt_providers,tts_providers}/.../routes.py`.                                                                                                                                   |
| `X-Accel-Buffering`                           | Response  | Disables nginx proxy buffering for SSE streaming chat (nginx directive echo).                                                                         | Set: `WorkspaceAPIs/Features/Chats/StreamingChat/StreamingChatController.cs`.                                                                                                                                                             |

### Notes

- **Case-insensitivity**: HTTP header names are case-insensitive, but source code spells some of them
  inconsistently (`X-TENANT-ID` vs `X-Tenant-Id`; `X-API-KEY` vs `X-Api-Key`). The canonical spellings above
  are what new code should use.
- **`X-API-KEY` vs `X-Api-Key`** are two distinct auth paths (internal machine/webhook auth vs outbound
  connector API keys) — do not conflate them.
- **Conditional headers**: `X-Client-Type`/`X-Client-Version` are only sent from the desktop app (Tauri).
  `X-Database-Name` is LLM-Pipeline-only. `X-Accel-Buffering` is nginx-specific.
- Canonical resolvers: `AspNetToolkit/Middleware/TenantResolver.cs` (space/env/tenant), and the outbound
  helper `shared/NodeLibrary/NodeLibrary.Core/Helpers/NodeHttpHeaders.cs`.

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
ENV=local python dev.py
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

## Deployment notes (upgrade behaviour)

These changes affect an existing deployment the next time it boots.

- **Community edition is an explicit opt-in.** Set `ON_PREM_EDITION=Community` on a Community install
  before the next boot. An existing Community install that leaves it unset will refuse to start, and so
  will a deployment that sets only one of the two identity variables. A paid deployment sets both
  `ON_PREM_TENANT_ID` and `ON_PREM_INSTANCE_KEY` and leaves `ON_PREM_EDITION` unset.
  - Both identity variables blank and no opt-in:
    `Refusing to start: ON_PREM_TENANT_ID and ON_PREM_INSTANCE_KEY are both blank and ON_PREM_EDITION is not set to 'Community'. Set both identity variables for a paid deployment, or set ON_PREM_EDITION=Community to run an explicit Community deployment.`
  - One identity variable set:
    `Refusing to start: <variable> is set but <other variable> is missing. Set both for a paid deployment, or unset both and set ON_PREM_EDITION=Community to run an explicit Community deployment.`
- **Startup seeding never rewrites existing rows.** A fresh Enterprise seed keeps a 365-day history
  retention; existing plans and subscriptions keep their stored retention, so an upgrade never shortens
  it. Commercial keeps its unlimited retention, and the history-cleanup job now skips those rows instead
  of failing.
- **Branding colours accept only hex, `rgb()` and `rgba()`.** `hsl()`/`hsla()` values are now invalid: a
  `BRANDING_*_COLOR` using hsl is ignored at startup with a warning and that property keeps its built-in
  default colour (the other colours still apply). Convert existing hsl values to hex or rgb before
  upgrading. Accepted: `#RGB`, `#RGBA`, `#RRGGBB`, `#RRGGBBAA`, `rgb(r,g,b)` and `rgba(r,g,b,a)` with
  comma-separated integer channels 0-255 and alpha 0-1.
- **SSO login state is per-process.** The Microsoft Entra login `state` lives 10 minutes in the
  AccountsAPIs process memory, so a deployment running more than one AccountsAPIs replica needs sticky
  sessions. A callback that lands on another replica is rejected as unknown state and the user must sign
  in again.

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

The desktop-app publish scripts run the release script automatically before `npx tauri build`. The RunnerApp `publish-ci.sh` already reads `<Version>` from the `.csproj` to name its artifact. The same tag is intended to tag future self-hosted Docker images.

### Usage going forward

The version is driven by git tags — you never edit the version strings by hand. To cut a new release:

```sh
# 1. Create a release tag (Desktop + Runner share this version)
git tag v0.1.87

# 2. Write the version into all target files
./scripts/release-version.sh            # Linux/macOS
.\scripts\release-version.ps1           # Windows

# 3. Build/publish the Desktop app (runs the release script automatically)
#    macOS:   ./clients/web-apps/apps/desktop-app/scripts/publish-and-upload-macos.sh
#    Windows: .\clients\web-apps\apps\desktop-app\scripts\publish-and-upload-windows.ps1
#    Linux:   ./clients/web-apps/apps/desktop-app/scripts/publish-and-upload-linux.sh

# 4. Build/publish the Runner app (reads <Version> from the .csproj)
bash clients/RunnerApp/RunnerApp.Linux/publish-ci.sh   # produces AvintraRunnerApp_<ver>_linux-x64.zip

# 5. Push the tag so CI and other developers see it
git push origin v0.1.87
```

**Release checklist:**

1. **Tag first** — the tag is the single source of truth. Use `v<X.Y.Z>` (e.g. `v0.1.87`).
2. **Run the release script** — it writes the version into `RunnerApp.Windows.csproj` (and `RunnerApp.Linux.csproj` / `RunnerApp.macOS.csproj`), `Cargo.toml`, `Cargo.lock`, `tauri.conf.json`, and `desktop-app/package.json`.
3. **Build the Desktop app** — the desktop-app publish scripts (`clients/web-apps/apps/desktop-app/scripts/`) already call the release script before `npx tauri build`, so this step is automatic.
4. **Publish the Runner app** — `RunnerApp.Linux/publish-ci.sh` derives the artifact name from `<Version>` in the `.csproj`.
5. **Push the tag** — so the version is recorded and CI can build from it.

> **Note:** if no tag exists yet, the release script errors and asks you to create one (or pass an explicit version, e.g. `./scripts/release-version.sh 0.1.87`).
