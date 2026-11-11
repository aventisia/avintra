---
name: build-docker-images
description: Build the platform's Docker images (frontend nginx, accounts/workspace APIs, llmpipeline) tagged for a container registry. Use when asked to build or tag images.
---

Build from the repo root after building the web apps. Take `<registry>` and `<tag>` from the request, and ask for any that is missing.

```sh
# Nginx frontend (expects accounts, workspace, and studio dist already built)
sudo docker build -f deploy/nginx/Dockerfile -t <registry>/avplatform/frontend:<tag> .

# Legacy .NET APIs
sudo docker build -f apis/WorcBackend-legacy/AccountsAPIs/Dockerfile -t <registry>/avplatform/accounts-apis:<tag> .
sudo docker build -f apis/WorcBackend-legacy/WorkspaceAPIs/Dockerfile -t <registry>/avplatform/workspace-apis:<tag> .

# LLM Pipeline (note the build context)
sudo docker build -f apis/llmpipeline/Dockerfile -t <registry>/avplatform/llmpipeline-apis:<tag> apis/llmpipeline
```
