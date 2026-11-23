# Server 2 Docker deployment

Aventisia runs production server 2 from the images in this folder. Server 1 and UAT still deploy through Jenkins. The customer stack and its guide are separate (issue #639). The full procedure, including Docker Hub and GitHub setup, is the internal guide `dev-docs-v2/step-by-step/docker-hub-setup-and-deployment.md`.

## Files

| File | Purpose |
| --- | --- |
| `web.Dockerfile`, `docs.Dockerfile`, `nginx/` | Web app and docs images (`build-docker-images` skill) |
| `compose.yml` | The server 2 stack: every service bound to `127.0.0.1` except LiveKit's media ports |
| `deploy.sh` | Deploys one commit: pulls its images, fills the shared folders, migrates Corsair, restarts, checks every service |
| `.env.example` | Template for `/opt/avintra/.env` |

## Flow

1. Every push to `main` runs `.github/workflows/docker-images.yml`, which pushes all 8 images to Docker Hub tagged `sha-<7-char commit>` (`api-sha-…` and `app-sha-…` in the private `avintra-global-admin` repo).
2. A reviewer approves the `production-server2` environment once Jenkins has deployed the same commit to server 1.
3. The job runs `ssh deploy@<server 2> <sha>`; the key's forced command is `/opt/avintra/deploy.sh`.
4. `deploy.sh` records the tag in `.env` only after every service answers. If anything fails after the shared folders change, it restores the previous release (`compose.yml` and the tag still in `.env`). Corsair migrations stay applied.

## Server layout

| Path | Contents |
| --- | --- |
| `/opt/avintra/deploy.sh` | Owned by root, so the `deploy` user cannot change it |
| `/opt/avintra/.env` | From `.env.example`; mode 600, owned by `deploy` |
| `/opt/avintra/env/*.env` | `shared.env` plus one file per service (`accounts-api`, `workspace-api`, `global-admin-api`, `llmpipeline-api`, `corsair-api`), copied from the bare-metal units. Service URLs use compose names, such as `http://accounts-api:4000` and `http://corsair-api:4006`. Never commit them. |
| `/opt/avintra/compose.yml`, `deploy.log` | The running release and the deploy history, written by `deploy.sh` |
| `/var/www/aventisia.com/files` | Shared folder; `deploy.sh` replaces `skills/`, `configs/Corsair/` and `scripts/` from the images |

## Install or update `deploy.sh`

`deploy.sh` warns when the commit it deploys carries a different `deploy.sh`. Reinstall it, reading it first:

```sh
curl -fsSL https://raw.githubusercontent.com/aventisia/avintra/main/deploy/docker/deploy.sh -o /tmp/deploy.sh
less /tmp/deploy.sh
sudo install -o root -g root -m 755 /tmp/deploy.sh /opt/avintra/deploy.sh
```

## Host nginx and firewall

The host's nginx terminates TLS and proxies to the `127.0.0.1` ports in `compose.yml`. Besides the app routes it needs the LiveKit signaling route, the same as the edge image's `/livekit/` block but pointing at `http://127.0.0.1:7880/`, with WebSocket upgrade and 24-hour read and send timeouts. It must not proxy `/corsair/api/`: Corsair has no authentication of its own. Allow 7881/tcp and 7882/udp in the cloud firewall for LiveKit media.

## Day to day

Run from `/opt/avintra`:

| Task | Command |
| --- | --- |
| What is running | `grep AVINTRA_TAG .env`, `docker compose ps`, `tail deploy.log` |
| Roll back | `sudo -H -u deploy ./deploy.sh <previous SHA from deploy.log>` |
| Logs | `docker compose logs -f --tail=200 <service>`; .NET daily files are in `logs/<service>/` |
| Change an env var | Edit `env/<file>.env`, then `docker compose up -d <service>` (`restart` does not reread env files) |

Each successful deploy removes images older than 30 days that no container uses, so rolling back further re-pulls them.
