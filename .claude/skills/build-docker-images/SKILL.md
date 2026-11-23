---
name: build-docker-images
description: Build the platform's Docker images (web frontends, docs, Accounts/Workspace/Global Admin APIs, LLM Pipeline, Corsair) tagged for a container registry. Use when asked to build or tag images.
---

Build from the repo root. Take `<registry>` and `<tag>` from the request, and ask for any that is missing. Every web image (`web.Dockerfile`, `docs.Dockerfile`) needs `--platform linux/amd64`: the lockfiles carry only x64 native binaries, so Apple Silicon builds run under emulation. Pass `--build-arg BUILD_MODE=staging` for a staging build of those images.

```sh
# Web apps (one Dockerfile, one target per image)
docker build --platform linux/amd64 -f deploy/docker/web.Dockerfile --target edge -t <registry>/avplatform/edge:<tag> .
docker build --platform linux/amd64 -f deploy/docker/web.Dockerfile --target frontend -t <registry>/avplatform/frontend:<tag> .
docker build --platform linux/amd64 -f deploy/docker/web.Dockerfile --target global-admin-app -t <registry>/avplatform/global-admin-app:<tag> .

# Docs site
docker build --platform linux/amd64 -f deploy/docker/docs.Dockerfile -t <registry>/avplatform/docs:<tag> .

# Legacy .NET APIs
docker build -f apis/WorcBackend-legacy/AccountsAPIs/Dockerfile -t <registry>/avplatform/accounts-apis:<tag> .
docker build -f apis/WorcBackend-legacy/WorkspaceAPIs/Dockerfile -t <registry>/avplatform/workspace-apis:<tag> .
docker build -f apis/WorcBackend-legacy/GlobalAdminAPIs/Dockerfile -t <registry>/avplatform/global-admin-apis:<tag> .

# LLM Pipeline and Corsair (note the build contexts)
docker build -f apis/llmpipeline/Dockerfile -t <registry>/avplatform/llmpipeline-apis:<tag> apis/llmpipeline
docker build -f apis/corsair/Dockerfile -t <registry>/avplatform/corsair:<tag> apis/corsair
```

`edge` serves the apps over HTTPS and proxies the APIs; `frontend` and `global-admin-app` are plain static servers on port 8080 for a host that already runs its own web server.
