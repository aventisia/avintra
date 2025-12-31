# Nginx Docker Setup for Aventisia Platform

This directory contains the Nginx configuration and Dockerfile for containerized deployment.

## Files

- `nginx.conf`: Main Nginx configuration
- `common_api_config.conf`, `common_headers.conf`, `common_map.conf`, `common_ssl.conf`: Common config includes
- `sites-available/accounts.aventisia.com`: Site-specific config for accounts.aventisia.com
- `Dockerfile`: Builds the Nginx image with all configs

## Usage

1. **Build the Docker image:**

   ```sh
   sudo docker build -t worc/nginx .
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
