# Nginx Docker Setup for Aventisia avplatform

This directory holds the Nginx configuration for the `edge` image, which serves the Accounts, Workspace and Studio web apps over HTTPS and proxies the APIs. The image is the `edge` target of `deploy/docker/web.Dockerfile`, which builds the web apps itself.

## Files

- `nginx.conf`: Main Nginx configuration
- `common_map.conf`: `map` blocks, loaded from `conf.d/` at the `http` level
- `common_api_config.conf`, `common_headers.conf`, `common_ssl.conf`, `common_chat_preview_headers.conf`: snippets, copied to `/etc/nginx/snippets/` and included where needed
- `sites-available/avintra.app.conf`: Site configuration template
- `docker-entrypoint.sh`: fills the host name and content security policy placeholders, then starts Nginx

## Runtime settings

- `APP_BASE_URL` (required): public host name, for example `avintra.your-domain.com`.
- `ENABLE_RAZORPAY` (optional): `true` adds Razorpay to the content security policy.
- Certificates: mount `ssl-bundle.crt` and `ssl.key` into `/etc/ssl/avplatform/`.
- Upstreams: the container must reach `accounts-apis:4000`, `workspace-apis:4001` and `llmpipeline-apis:4003` by those names.
- Files: mount the shared files folder at `/var/www/aventisia.com/files` for downloads.

## Build

Build from the project root:

```sh
docker build --platform linux/amd64 -f deploy/docker/web.Dockerfile --target edge -t <registry>/avplatform/edge:<tag> .
```

The web-app lockfile carries only x64 native binaries, so the build targets `linux/amd64`; on Apple Silicon it runs under emulation and is slow.
