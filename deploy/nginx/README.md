# Nginx Docker Setup for Aventisia av-platform

This directory contains the Nginx configuration and Dockerfile for containerized deployment.

## Files

- `nginx.conf`: Main Nginx configuration
- `common_api_config.conf`, `common_headers.conf`, `common_map.conf`, `common_ssl.conf`: Common config includes
- `sites-available/aventisia.avplatform`: Site-specific configuration template
- `Dockerfile`: Builds the Nginx image with all configs

## Usage

1. **Build & Push the Docker image (build from project root):**

```sh
# Build
sudo docker build -f deploy/nginx/Dockerfile -t acr.aventisia.com/avplatform/frontend:0.4.0 .

# Push
sudo docker push acr.aventisia.com/avplatform/frontend:0.4.0
```