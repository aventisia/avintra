# Nginx Docker Setup for Aventisia Platform

This directory contains the Nginx configuration and Dockerfile for containerized deployment.

## Files

- `nginx.conf`: Main Nginx configuration
- `common_api_config.conf`, `common_headers.conf`, `common_map.conf`, `common_ssl.conf`: Common config includes
- `sites-available/accounts.aventisia.com`: Site-specific config for accounts.aventisia.com
- `Dockerfile`: Builds the Nginx image with all configs

## Usage

1. **Build the Docker image (build from project root):**

```sh
# Build
sudo docker build -f deploy/nginx/Dockerfile -t worc/nginx:latest .

# Test run locally (ensure SSL certs are available at /etc/ssl/aventisia and localhost is set up in server_name temporarily for testing)
sudo docker run -d --name nginx-test -p 80:80 -p 443:443 -v /etc/ssl/aventisia:/etc/ssl/aventisia:ro worc/nginx:latest

# Check logs
sudo docker logs -f nginx-test

# Stop and remove test container
sudo docker stop nginx-test && sudo docker rm nginx-test

# Push to private registry (optional)
sudo docker tag worc/nginx:latest hub.aventisia.com/worc/nginx:latest
sudo docker push hub.aventisia.com/worc/nginx:latest

# Login to private registry (if needed)
sudo docker login hub.aventisia.com
```

2. **Run with Docker Compose (recommended) or Docker CLI:**

   - Mount your SSL certs and keys at runtime (do not copy them into the image):
     ```yaml
     services:
       nginx:
         image: aventisia-nginx
         volumes:
           - /path/on/host/aventisia:/etc/ssl/aventisia:ro # Mount SSL folder (contains .crt and .key)
           # - /path/to/static/build:/usr/share/nginx/html/clientname:ro  # Mount static files if not copying in Dockerfile
     ```
   - This keeps your SSL files secure and allows updates without rebuilding the image.
   - To run with Docker CLI:
    ```sh
    sudo docker run --name nginx -d -p 80:80 -p 443:443 \
       -v /path/on/host/aventisia:/etc/ssl/aventisia:ro \
       worc/nginx:latest
    ```

3. **Build and mount static files:**

   - Build each client (e.g., React) first to generate static files (e.g., `build` or `dist` folder).
   - Copy or mount these into the Nginx image/container at `/usr/share/nginx/html/clientname`.

4. **Multi-environment support:**

   - For dev/uat/prod, either:
     - Add all subdomains to `server_name` in your site config, or
     - Use separate config files for each environment (e.g., `dev-accounts.aventisia.com.conf`).

5. **Site configs in Docker:**

   - In Docker, Nginx loads configs from `/etc/nginx/conf.d/` (not `sites-available`/`sites-enabled`).
   - Copy your site configs directly to `conf.d/` in the Dockerfile.

6. **Update `proxy_pass` and `root` directives** as you add more services/clients.
