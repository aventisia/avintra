Worc Platform monorepo

## Overview

This repository contains the source code and deployment configurations for the Worc Platform, a comprehensive solution for managing various services and applications.

# Login to private registry (if needed)

sudo docker login acr.aventisia.com

sudo docker network create worc-net

## How to build and push images to `acr.aventisia.com`

Make sure you are logged in to `acr.aventisia.com` by running the command `sudo docker login acr.aventisia.com`

```sh
# Step 1: Install dependencies for client apps
npm --prefix clients/worc-web-legacy/accounts install
npm --prefix clients/worc-web-legacy/workspace install
npm --prefix clients/worc-web-legacy/studio install --force
npm --prefix clients/worc-web-legacy/ml-model-builder install

# Step 2: Run npm audit fix if needed
npm --prefix clients/worc-web-legacy/accounts audit fix
npm --prefix clients/worc-web-legacy/workspace audit fix
npm --prefix clients/worc-web-legacy/studio audit fix --force
npm --prefix clients/worc-web-legacy/ml-model-builder audit fix

# Step 3: Build clients to generate static files (change mode as needed)
npm --prefix clients/worc-web-legacy/accounts run build --mode=production
npm --prefix clients/worc-web-legacy/workspace run build --mode=production
npm --prefix clients/worc-web-legacy/studio run build --mode=production
npm --prefix clients/worc-web-legacy/ml-model-builder run build --mode=production

# Step 4: Build images for frontend and backend services
sudo docker build -f deploy/nginx/Dockerfile -t acr.aventisia.com/worc/frontend:0.1.0 .
sudo docker build -f apis/WorcBackend-legacy/AccountsAPIs/Dockerfile -t acr.aventisia.com/worc/accounts-apis:0.1.0 .
sudo docker build -f apis/WorcBackend-legacy/WorkspaceAPIs/Dockerfile -t acr.aventisia.com/worc/worc-apis:0.1.0 .
# Build fastapi llmpipline separately to optimize the build image
cd apis/llmpipeline && sudo docker build -t acr.aventisia.com/worc/llmpipeline-apis:0.1.0 . && cd ../..

# Step 6: Push images to private registry
sudo docker push acr.aventisia.com/worc/frontend:0.1.0
sudo docker push acr.aventisia.com/worc/accounts-apis:0.1.0
sudo docker push acr.aventisia.com/worc/worc-apis:0.1.0
sudo docker push acr.aventisia.com/worc/llmpipeline-apis:0.1.0
```

> Detailed deployment instructions for individual services can be found in their respective directories.

## Retag and push images to `aventisiaacr.azurecr.io`

Whenever we have stable version of the images in `acr.aventisia.com`, we need to retag and push them to `aventisiaacr.azurecr.io` for clients on premises production deployment.

```sh
# Retagging the image for azurecr.io
sudo docker tag acr.aventisia.com/worc/frontend:0.1.0 aventisiaacr.azurecr.io/worc/frontend:0.1.0
sudo docker tag acr.aventisia.com/worc/accounts-apis:0.1.0 aventisiaacr.azurecr.io/worc/accounts-apis:0.1.0
sudo docker tag acr.aventisia.com/worc/worc-apis:0.1.0 aventisiaacr.azurecr.io/worc/worc-apis:0.1.0
sudo docker tag acr.aventisia.com/worc/llmpipeline-apis:0.1.0 aventisiaacr.azurecr.io/worc/llmpipeline-apis:0.1.0

# Login to aventisiaacr.azurecr.io using the ACR Token username and password
sudo docker login aventisiaacr.azurecr.io -u internal-pushpull-token -p <acr_tokeen_password>

# Pushing the retagged images to azurecr.io
sudo docker push aventisiaacr.azurecr.io/worc/frontend:0.1.0
sudo docker push aventisiaacr.azurecr.io/worc/accounts-apis:0.1.0
sudo docker push aventisiaacr.azurecr.io/worc/worc-apis:0.1.0
sudo docker push aventisiaacr.azurecr.io/worc/llmpipeline-apis:0.1.0
```
