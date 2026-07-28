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
