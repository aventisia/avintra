# Docker deployment of Aventisia's servers

Aventisia's own servers can run from the images in this folder instead of the Jenkins bare-metal deploy. UAT (`avuat.aventisia.com`) goes first; production server 2 follows once UAT has run well on it. Production server 1 stays on Jenkins. The customer stack and its guide are separate (issue #639). Docker Hub setup and the original server 2 procedure are in the internal guide `dev-docs-v2/step-by-step/docker-hub-setup-and-deployment.md`.

## Files

| File | Purpose |
| --- | --- |
| `web.Dockerfile`, `docs.Dockerfile`, `nginx/` | Web app and docs images (`build-docker-images` skill) |
| `DEPLOYMENT.md` | Quick step-by-step guide to deploy the stack on a server |
| `compose.yml` | One server's stack: every service bound to `127.0.0.1` except LiveKit's media ports; an optional bundled Postgres (profile `db`, see `DEPLOYMENT.md`) |
| `deploy.sh` | Deploys one commit: pulls its images, fills the shared folders, starts the bundled Postgres when enabled, migrates Corsair, restarts, checks every service, seeds the Corsair tools |
| `.env.example` | Template for `/opt/avintra/.env` |
| `env/*.env.example` | Templates for `/opt/avintra/env/*.env`: `shared`, `accounts-api`, `workspace-api`, `global-admin-api`, `llmpipeline-api`, `corsair-api` |

## Flow

1. Every push to `uat` or `main` runs `.github/workflows/docker-images.yml`, which pushes all 8 images to the `aventisia` Docker Hub namespace (`api-…` and `app-…` tags in the private `avintra-global-admin` repo).
   - `uat` builds the web apps in staging mode and tags `uat-sha-<7-char commit>`.
   - `main` builds production and tags `sha-<7-char commit>`.
2. The deploy job runs `ssh deploy@<host> <sha>`; the key's forced command is `/opt/avintra/deploy.sh`.
   - `uat` deploys UAT right away (GitHub environment `uat`).
   - `main` deploys server 2 only while the repository variable `SERVER2_DOCKER_DEPLOY` is `true`, after a reviewer approves the `production-server2` environment once Jenkins has deployed the same commit to server 1.
3. `deploy.sh` builds the tag from `AVINTRA_TAG_PREFIX` in `.env` and records it only after every service answers. If anything fails after the shared folders change, it restores the previous release (`compose.yml` and the tag still in `.env`). Corsair migrations stay applied.

Jenkins skips the services Docker runs on branches listed in `dockerDeployedBranches()` (today `uat`). It still deploys Apache Camel, which is not part of the Docker stack, and uploads the Runner App zip into the shared folder.

## GitHub setup

| Where | Name | Value |
| --- | --- | --- |
| Repository variable | `DOCKERHUB_USERNAME` | Account that pushes to `aventisia` |
| Repository secret | `DOCKERHUB_TOKEN` | Its read-write access token |
| Repository variable | `SERVER2_DOCKER_DEPLOY` | `true` once server 2 runs Docker; unset until then |
| Environments `uat` and `production-server2` | Secrets `DEPLOY_SSH_KEY`, `DEPLOY_KNOWN_HOSTS`; variable `DEPLOY_HOST` | That server's deploy key, its `ssh-keyscan` line, its host name |

Limit `uat` to the `uat` branch and `production-server2` to `main` with required reviewers.

## Server layout

| Path | Contents |
| --- | --- |
| `/opt/avintra/deploy.sh` | Owned by root, so the `deploy` user cannot change it |
| `/opt/avintra/.env` | From `.env.example`; mode 600, owned by `deploy`. UAT sets `AVINTRA_TAG_PREFIX=uat-` |
| `/opt/avintra/env/*.env` | `shared.env` plus one file per service (`accounts-api`, `workspace-api`, `global-admin-api`, `llmpipeline-api`, `corsair-api`), copied from `/etc/environment` and the bare-metal units. Service URLs live once in `shared.env` (`ACCOUNTS_API_BASE_URL`, `WORKSPACE_API_BASE_URL`, `CORSAIR_API_BASE_URL`, with compose names such as `http://accounts-api:4000`); the .NET services and LLM Pipeline all read them, so no service file repeats them. Templates: `env/*.env.example`. Never commit them. |
| `/opt/avintra/compose.yml`, `deploy.log` | The running release and the deploy history, written by `deploy.sh` |
| `/var/www/aventisia.com/files` | Shared folder; `deploy.sh` replaces `skills/`, `configs/Corsair/` and `scripts/` from the images |

## Install or update `deploy.sh`

`deploy.sh` warns when the commit it deploys carries a different `deploy.sh`. Reinstall it from the server's branch (`uat` or `main`), reading it first:

```sh
curl -fsSL https://raw.githubusercontent.com/aventisia/avintra/uat/deploy/docker/deploy.sh -o /tmp/deploy.sh
less /tmp/deploy.sh
sudo install -o root -g root -m 755 /tmp/deploy.sh /opt/avintra/deploy.sh
```

## Host nginx and firewall

The host's nginx terminates TLS and proxies to the `127.0.0.1` ports in `compose.yml`: the APIs keep their bare-metal ports, and the static sites move to the frontend (8080), docs (8081) and Global Admin app (8082) containers. It also needs the LiveKit signaling route, the same as the edge image's `/livekit/` block but pointing at `http://127.0.0.1:7880/`, with WebSocket upgrade and 24-hour read and send timeouts. It must not proxy `/corsair/api/`: Corsair has no authentication of its own. Allow 7881/tcp and 7882/udp in the cloud firewall for LiveKit media.

## Switch a server from bare metal

Bare metal stays installed but stopped, so going back takes a minute.

1. Install Docker, create the `deploy` user and its forced-command key, log in to Docker Hub as that user, fill `/opt/avintra/.env` and `env/*.env`, install `deploy.sh`, and open the firewall ports.
2. Stop and disable the bare-metal units: `accounts_apis`, `workspace_apis`, `globaladmin_apis`, `llmpipeline_apis` and `corsair_apis` (`apachecamel_apis` keeps running). Remove any standalone `livekit` container. The server is down from here until step 4 finishes.
3. Back up the host nginx site, change it as in [Host nginx and firewall](#host-nginx-and-firewall), and run `sudo nginx -t && sudo systemctl reload nginx`.
4. UAT: merge the change that lists `uat` in `dockerDeployedBranches()`; Jenkins stops deploying the services, and the workflow builds `uat-` images and deploys them. Server 2: set `SERVER2_DOCKER_DEPLOY` to `true` (Jenkins deploys only server 1, so it needs no switch). Either way, a commit whose images already exist deploys by hand with `sudo -H -u deploy /opt/avintra/deploy.sh <full sha>`.
5. Test sign-in, Workspace, a flow run, a voice call, a Corsair integration, the Runner download and Global Admin.

To go back: `docker compose down` in `/opt/avintra`, `sudo systemctl enable --now` the units, restore the nginx backup and reload it, and turn the deploy off (remove `uat` from `dockerDeployedBranches()`, or unset `SERVER2_DOCKER_DEPLOY`). On UAT, then run a manual Jenkins build with every component in `REPOS_TO_BUILD`, since bare metal missed the deploys made while Docker ran.

## Day to day

Run from `/opt/avintra`:

| Task | Command |
| --- | --- |
| What is running | `grep AVINTRA_TAG .env`, `docker compose ps`, `tail deploy.log` |
| Roll back | `sudo -H -u deploy ./deploy.sh <previous SHA from deploy.log>` |
| Logs | `docker compose logs -f --tail=200 <service>`; .NET daily files are in `logs/<service>/` |
| Change an env var | Edit `env/<file>.env`, then `docker compose up -d <service>` (`restart` does not reread env files) |

Each successful deploy removes images older than 30 days that no container uses, so rolling back further re-pulls them.
