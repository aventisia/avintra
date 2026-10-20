---
name: build-docker-images
description: Build the platform's Docker images (frontend nginx, accounts/workspace APIs, llmpipeline) with the acr.aventisia.com tags. Use when asked to build or tag images.
---

Build from the repo root after building the web apps.

```sh
# Nginx frontend (expects accounts, workspace, and studio dist already built)
sudo docker build -f deploy/nginx/Dockerfile -t acr.aventisia.com/avplatform/frontend:<tag> .

# Legacy .NET APIs
sudo docker build -f apis/WorcBackend-legacy/AccountsAPIs/Dockerfile -t acr.aventisia.com/avplatform/accounts-apis:<tag> .
sudo docker build -f apis/WorcBackend-legacy/WorkspaceAPIs/Dockerfile -t acr.aventisia.com/avplatform/workspace-apis:<tag> .

# LLM Pipeline (note the build context)
sudo docker build -f apis/llmpipeline/Dockerfile -t acr.aventisia.com/avplatform/llmpipeline-apis:<tag> apis/llmpipeline
```
