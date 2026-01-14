Worc Platform monorepo

## Overview

This repository contains the source code and deployment configurations for the Worc Platform, a comprehensive solution for managing various services and applications.

# Login to private registry (if needed)
sudo docker login hub.aventisia.com

sudo docker network create worc-net

## How to deploy

Detailed deployment instructions for individual services can be found in their respective directories:

```sh
# Step 1: Build clients to generate static files
npm --prefix clients/worc-web-legacy/accounts run build --mode=staging
npm --prefix clients/worc-web-legacy/workspace run build --mode=staging
npm --prefix clients/worc-web-legacy/studio run build --mode=staging
npm --prefix clients/worc-web-legacy/ml-model-builder run build --mode=staging

# Step 2: Build and push Nginx image
sudo docker build -f deploy/nginx/Dockerfile -t hub.aventisia.com/worc/nginx:0.2.0 .
sudo docker build -f apis/WorcBackend-legacy/AccountsAPIs/Dockerfile -t hub.aventisia.com/worc/accounts-apis:0.2.0 .
sudo docker build -f apis/WorcBackend-legacy/WorkspaceAPIs/Dockerfile -t hub.aventisia.com/worc/worc-apis:0.2.0 .
sudo docker build -f apis/WorcBackend-legacy/MLModelBuilderAPIs/Dockerfile -t hub.aventisia.com/worc/aistudio-apis:0.2.0 .

# Step 3: Build fastapi llmpipline separately to optimize the build image
cd apis/llmpipeline && sudo docker build -t hub.aventisia.com/worc/llmpipeline-apis:0.2.0 . && cd ../..

# Step 4: Push images to private registry
sudo docker push hub.aventisia.com/worc/nginx:0.2.0
sudo docker push hub.aventisia.com/worc/accounts-apis:0.2.0
sudo docker push hub.aventisia.com/worc/worc-apis:0.2.0
sudo docker push hub.aventisia.com/worc/aistudio-apis:0.2.0
sudo docker push hub.aventisia.com/worc/llmpipeline-apis:0.2.0

# Step 4: Run containers
#-- Run nginx in the end since it depends on other services
```