---
name: build-docker-images
description: Build the platform's Docker images (web frontends, docs, Accounts/Workspace/Global Admin APIs, LLM Pipeline, Corsair) tagged for a container registry. Use when asked to build or tag images.
---

Build from the repo root. Images live under the `aventisia` Docker Hub namespace. Take `<tag>` from the request, and ask for it when missing. The names match what `.github/workflows/docker-images.yml` pushes on every `main` commit as `sha-<7-char commit>`, so never reuse a `sha-` tag for a local build. Every web image (`web.Dockerfile`, `docs.Dockerfile`) needs `--platform linux/amd64`: the lockfiles carry only x64 native binaries, so Apple Silicon builds run under emulation. Pass `--build-arg BUILD_MODE=staging` for a staging build of those images.

```sh
# Web apps (one Dockerfile, one target per image)
docker build --platform linux/amd64 -f deploy/docker/web.Dockerfile --target edge -t aventisia/avintra-edge:<tag> .
docker build --platform linux/amd64 -f deploy/docker/web.Dockerfile --target frontend -t aventisia/avintra-frontend:<tag> .
docker build --platform linux/amd64 -f deploy/docker/web.Dockerfile --target global-admin-app -t aventisia/avintra-global-admin:app-<tag> .

# Docs site
docker build --platform linux/amd64 -f deploy/docker/docs.Dockerfile -t aventisia/avintra-docs:<tag> .

# Legacy .NET APIs
docker build -f apis/WorcBackend-legacy/AccountsAPIs/Dockerfile -t aventisia/avintra-accounts-api:<tag> .
docker build -f apis/WorcBackend-legacy/WorkspaceAPIs/Dockerfile -t aventisia/avintra-workspace-api:<tag> .
docker build -f apis/WorcBackend-legacy/GlobalAdminAPIs/Dockerfile -t aventisia/avintra-global-admin:api-<tag> .

# LLM Pipeline and Corsair (note the build contexts)
docker build -f apis/llmpipeline/Dockerfile -t aventisia/avintra-llmpipeline-api:<tag> apis/llmpipeline
docker build -f apis/corsair/Dockerfile -t aventisia/avintra-corsair-api:<tag> apis/corsair
```

`edge` serves the apps over HTTPS and proxies the APIs; `frontend` and `global-admin-app` are plain static servers on port 8080 for a host that already runs its own web server. Both Global Admin images share the private `avintra-global-admin` repository through the `app-` and `api-` tag prefixes; every other repository is public.
