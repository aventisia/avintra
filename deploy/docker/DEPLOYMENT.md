# Docker deployment: quick guide

Deploy the Avintra stack (web apps, docs, Accounts, Workspace, Global Admin, LLM Pipeline, Corsair, LiveKit) on one Linux server from the Docker Hub images. 

## You need

- Ubuntu server, a DNS name for it, and a TLS certificate (host nginx terminates TLS).
- PostgreSQL: either the bundled container (nothing to install) or an existing server the containers can reach.
- An Azure Blob connection string, OpenAI and OpenRouter keys, and a LiveKit key pair.
- A Docker Hub account with read access to the `aventisia` namespace (Global Admin images are private).

## 1. Install Docker

Install `docker-ce` and the compose plugin from [Docker's apt repo](https://docs.docker.com/engine/install/ubuntu/), then enable log rotation:

```sh
sudo tee /etc/docker/daemon.json <<'EOF'
{ "log-driver": "json-file", "log-opts": { "max-size": "50m", "max-file": "5" }, "live-restore": true }
EOF
sudo systemctl restart docker
```

## 2. Deploy user and folders

```sh
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG docker deploy
sudo install -d -o deploy -g deploy -m 750 /opt/avintra /opt/avintra/env /opt/avintra/logs
sudo mkdir -p /var/www/aventisia.com/files /var/www/aventisia.com/temp-files
sudo -H -u deploy docker login -u aventisia
```

## 3. Install `deploy.sh`

Read it first, then install it root-owned so the `deploy` user cannot change it. Use `main` instead of `uat` on a production server.

```sh
curl -fsSL https://raw.githubusercontent.com/aventisia/avintra/uat/deploy/docker/deploy.sh -o /tmp/deploy.sh
less /tmp/deploy.sh
sudo install -o root -g root -m 755 /tmp/deploy.sh /opt/avintra/deploy.sh
```

## 4. Configure

Fetch the templates (UAT shown; `main` for production) and fill every `CHANGE_ME`:

```sh
B=https://raw.githubusercontent.com/aventisia/avintra/uat/deploy/docker
sudo -u deploy curl -fsSL -o /opt/avintra/.env $B/.env.example
for f in shared accounts-api workspace-api global-admin-api llmpipeline-api corsair-api; do
  sudo -u deploy curl -fsSL -o /opt/avintra/env/$f.env $B/env/$f.env.example
done
sudo chmod 600 /opt/avintra/.env /opt/avintra/env/*.env
```

| File | Set |
| --- | --- |
| `/opt/avintra/.env` | `AVINTRA_TAG_PREFIX=uat-` on UAT (empty on production), `LIVEKIT_WS_URL=wss://<host>/livekit`, a key pair from `docker run --rm livekit/livekit-server:v1.13.11 generate-keys`, and the database choice below |
| `env/shared.env` | `APP_BASE_URL` (host name, no `https://`), `POSTGRESQL_*`, `JWT_SECRET_KEY` |
| `env/accounts-api.env`, `env/workspace-api.env` | `ON_PREM_ADMIN_EMAIL`, the Blob connection string, the AES key pair (identical in both files) |
| `env/llmpipeline-api.env` | `OPENAI_API_KEY`, `OPENROUTER_API_KEY`, Qdrant URL and key |
| `env/corsair-api.env` | `CORSAIR_KEK` |
| `env/global-admin-api.env` | Nothing required; the file must exist |

**Database: pick one.**

| | Bundled Postgres (new server, Community, dev/UAT) | Existing Postgres |
| --- | --- | --- |
| `/opt/avintra/.env` | `COMPOSE_PROFILES=db`, plus `POSTGRESQL_USERNAME` and `POSTGRESQL_PASSWORD` | Leave all three blank |
| `env/shared.env` | `POSTGRESQL_HOST=postgres`, and the same username and password | The server's IP or host name (never `localhost`/`127.x`: inside a container that is the container itself), port, username, password |
| Data | Docker volume `avintra_pgdata`; it survives redeploys and there is no backup unless you add one | Yours |

The bundled image is `pgvector/pgvector:pg16` (Workspace needs the `vector` extension). The apps and Corsair create their databases on first start. An existing server needs `listen_addresses` and a `pg_hba.conf` line for the Docker networks (`172.16.0.0/12`); see Step 15 of the long guide. Switching an existing server to the bundled database starts it empty, so move the data first.

Commercial/Enterprise: also set `ON_PREM_TENANT_ID` and `ON_PREM_INSTANCE_KEY` (same pair in Accounts, Workspace and LLM Pipeline).

New server with an empty database only, generate the secrets (never regenerate them where data exists):

```sh
openssl rand -base64 64 | tr -d '\n'; echo   # JWT_SECRET_KEY
openssl rand -base64 32                      # AES_ENCRYPTION_KEY
openssl rand -base64 16                      # AES_INITIALIZATION_VECTOR
openssl rand -hex 32                         # CORSAIR_KEK
```

Quote values that contain `$` with single quotes. Never commit these files. The AES pair only matters for a new database: an existing one holds data encrypted with its old pair.

## 5. nginx and firewall

Point the host nginx at the `127.0.0.1` ports in [`compose.yml`](compose.yml): web apps 8080, docs 8081, Global Admin 8082, Accounts 4000, Workspace 4001, LLM Pipeline 4003, Global Admin API 4004, LiveKit `/livekit/` 7880 (WebSocket upgrade). Do not proxy Corsair. Details: [Host nginx and firewall](README.md#host-nginx-and-firewall). Reload with `sudo nginx -t && sudo systemctl reload nginx`.

Open 80, 443, 7881/tcp and 7882/udp. Docker-published ports bypass UFW, which is why `compose.yml` binds everything else to `127.0.0.1`.

## 6. First deploy

Images exist for every commit pushed to `uat` or `main` (CI: `.github/workflows/docker-images.yml`). Deploy one by its full SHA:

```sh
sudo -H -u deploy /opt/avintra/deploy.sh <40-char commit sha>
```

The script pulls the images, starts the bundled Postgres if enabled, migrates Corsair, starts the stack, waits for every service, seeds the Corsair tools, and rolls back by itself if one does not answer. The databases are created and migrated on first start.

## 7. Check

```sh
cd /opt/avintra
docker compose ps
tail deploy.log
curl -I https://<host>/accounts/
```

Then sign in, send a chat message, upload a file to a knowledge base, and open Global Admin.

## Day to day

| Task | Command (in `/opt/avintra`) |
| --- | --- |
| Redeploy or roll back | `sudo -H -u deploy ./deploy.sh <sha>` (previous SHAs are in `deploy.log`) |
| Logs | `docker compose logs -f --tail=200 <service>` |
| Change an env var | Edit `env/<file>.env`, then `docker compose up -d <service>` (`restart` does not reread env files) |
| Automatic deploys on push | GitHub environment secrets and an SSH forced-command key: [README, GitHub setup](README.md#github-setup) |
