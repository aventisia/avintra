# Bruno API Tests

Bruno test collections for the Aventisia WORC Platform APIs.

## Overview

This directory contains [Bruno](https://www.usebruno.com/) collections used to manually and automatically exercise the platform's REST APIs. Collections are organized by service.

## Collections

| Collection        | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `AccountsAPIs`    | Identity, accounts, tenants, subscriptions, billing  |
| `WorkspaceAPIs`   | Flows, executions, files, chat, connectors, projects |
| `llmpipelineapis` | Text extraction, OCR, TTS, STT, LLM providers        |
| `CamelAPIs`       | Apache Camel connectors, operations, schemas         |
| `Corsair`         | Corsair sidecar: connect links, tools, credentials   |
| `GlobalAdminAPIs` | External GlobalAdmin service: on-prem tenants/instances |

## Getting Started

1. Install [Bruno](https://www.usebruno.com/downloads).
2. Open this folder (`tests/bruno`) as a Bruno collection/workspace.
3. Select an environment under `environments/` (`localhost`, `local`, `uat`, `prod`).
4. Set up your **Global Environment** in Bruno (see below), then run requests or folders in dependency order (auth first).

## Running via CLI (automated)

The Bruno CLI (`bru`, [@usebruno/cli](https://docs.usebruno.com/bru-cli/quick-start)) is a local devDependency — no global install needed. From this folder:

```sh
npm ci
```

| Command                    | What it does                                            |
| -------------------------- | ------------------------------------------------------- |
| `npm test`                 | Run the whole collection against `--env localhost`      |
| `npm run test:local`       | Run against `local` (local-avintra reverse proxy)       |
| `npm run test:localhost`   | Run against `localhost` (direct service ports)          |
| `npm run test:uat`         | Run against `uat`                                       |
| `npm run test:tests-only`  | Only requests with tests/assertions (`--tests-only`)    |
| `npm run test:accounts`    | Run one service folder, e.g. `AccountsAPIs` (`-r`)      |
| `npm run test:workspace`   | Run `WorkspaceAPIs` (`-r`)                              |
| `npm run test:llmpipeline` | Run `llmpipelineapis` (`-r`)                            |
| `npm run test:camel`       | Run `CamelAPIs` (`-r`)                                  |
| `npm run test:corsair`     | Run `Corsair` (`-r`)                                    |
| `npm run test:globaladmin` | Run `GlobalAdminAPIs` (`-r`)                            |
| `npm run test:report`      | Full run + HTML/JSON/JUnit reports in `results/`        |
| `npm run test:ci`          | CI run: env from `BRU_ENV` (default `uat`) + JUnit/HTML |

Single request or folder, ad hoc (paths are relative to this folder):

```sh
npx bru run --env localhost Corsair/health-check.bru
npx bru run -r --env localhost AccountsAPIs/login-with-pwd
```

Folder runs require `-r` (recursive) — without it `bru` silently runs 0 requests.

### Secrets and login credentials

Store secrets in a `.env` file at this collection's root — `tests/bruno/.env` (gitignored). Bruno loads it automatically for both the CLI and the desktop app, and `environments/*.bru` map the login credentials into variables:

```sh
# tests/bruno/.env  — copy .env.sample and fill in your own values
MY_EMAIL=you@example.com
MY_PWD='secret'

# Local service ports read by environments/localhost.bru
ACCOUNTS_API_PORT=4000
WORKSPACE_API_PORT=4001
LLMPIPELINE_API_PORT=4003
CAMEL_API_PORT=4005
CORSAIR_API_PORT=4006
```

With that in place, the normal commands work with no extra flags:

```sh
npm run test:localhost
```

Quote values containing `#`, `\`, `"`, or newlines (e.g. `MY_PWD="p@ss#word"`); see the [DotEnv docs](https://docs.usebruno.com/secrets-management/dotenv-file). For CI or one-off overrides, `--env-var` still takes precedence over `.env` (appended after `--` so npm forwards them):

```sh
npm run test:local -- --env-var MY_EMAIL=you@example.com --env-var MY_PWD='secret'
BRU_ENV=local npm run test:ci -- --env-var MY_EMAIL=you@example.com --env-var MY_PWD='secret'
```

Auto-chained ids (`ACCESS_TOKEN`, `TENANT_ID`, `FLOW_ID`, …) are populated in-memory by `script:post-response` blocks during a single `bru run`, so run folders top-down in one invocation rather than request-by-request.

### Running from a git worktree

`environments/localhost.bru` takes its ports from the `*_API_PORT` entries in `.env`. `scripts/create-worktree.sh` (or `.ps1`) copies `.env` into each new worktree and re-prefixes those ports with the worktree number, so the usual command targets the worktree's own services with no extra flags:

```sh
npm run test:localhost
```

### CI

```yaml
- run: npm ci
  working-directory: tests/bruno
- run: npm run test:ci -- --env-var MY_EMAIL=${{ secrets.BRU_EMAIL }} --env-var MY_PWD=${{ secrets.BRU_PWD }}
  working-directory: tests/bruno
  env:
    BRU_ENV: uat
```

JUnit output lands in `results/junit.xml` (`results/` is gitignored). Never commit secrets or tokens in environment files.

## Environments vs Global Environment

- `environments/*.bru` contain the API base URLs (`ACCOUNTS_API_BASE_URL`, `WORKSPACE_API_BASE_URL`, `LLMPIPELINE_API_BASE_URL`, `CAMEL_API_BASE_URL`, `CORSAIR_API_BASE_URL`, `GLOBALADMIN_API_BASE_URL`) plus login credentials (`MY_EMAIL`/`MY_PWD`, per-role `SA/TA/OM/TD/TU_EMAIL`/`_PWD`) and the localhost ports (`*_API_PORT`) mapped from `.env`. No literal secrets, no IDs.
- Login credentials (`MY_*`, `SA/TA/OM/TD/TU_*`) come from the gitignored `tests/bruno/.env`, not the Global Environment. The DB seed creates only the super user (random password) — create one user per role manually before using the role credentials.
- Everything else lives in Bruno's **Global Environment** (per-tester, never committed):
  - **Seed these yourself:** credentials for the connectors you exercise (`SQL_CREDENTIAL_NAME`, `MAILBOX_ADDRESS`/`MAIL_USERNAME`/`MAIL_PASSWORD`, `FTP_HOST`/`FTP_USERNAME`/`FTP_PASSWORD`, `POSTGRES_*`, `KAFKA_*`, `JMS_*`, `IMAP_*/SMTP_*`, `CORSAIR_*`, `CUSTOM_API_KEY`, `API_KEY`, `FILE_PATH`, `tenant_id`, `workspace_session_cookie`).
  - **Auto-chained, do not set manually:** `ACCESS_TOKEN`, `TENANT_ID`, `FLOW_ID`, `FLOW_VERSION_ID`, `*_ID` resource ids, `SEARCH_KEY`, `VERIFICATION_CODE_ID` — populated by `script:post-response` blocks as you run the collection top-down.
- Request bodies use Bruno **native dynamic variables** (`{{$randomEmail}}`, `{{$randomCompanyName}}`, `{{$guid}}`, `{{$isoTimestamp}}`, …) — no `faker`/`moment` dependencies, no `script:pre-request` body building (except `notification-scheduling`, which needs real timers).

## Files

- `collection.bru` — Root collection metadata
- `bruno.json` — Bruno configuration
- `environments/` — Environment-specific variables (base URLs, login credential and localhost port mapping)
- `.env.sample` — Template for the gitignored `.env` (secrets; copy and fill in)

## Notes

- Do not commit secrets or production tokens in environment files.
- Keep request naming consistent with the feature or controller it targets.
