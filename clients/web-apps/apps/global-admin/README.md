# Global Admin App

React + Vite application for the Aventisia WORC Platform Global Admin area.

## Overview

This app is part of the `clients/web-apps` Turborepo monorepo. It manages on-premises tenants, their instances, and the execution data reported by those instances. It replaces the Global Admin section that used to live inside the Workspace app.

## Getting Started

Run from the monorepo root:

```sh
cd clients/web-apps
npm install
npx turbo run dev --filter=global-admin
```

The app runs on port `3003` by default and is served from `/globaladmin/`. In development the dev server proxies `/globaladmin/api` to `http://localhost:4004` and `/accounts/api` to `http://localhost:4000`; published builds call the Global Admin API at `https://uat-globaladmin.aventisia.com/api` (staging) or `https://globaladmin.aventisia.com/api` (production).

## Access

Signing in goes through the Accounts app. The app reads the Accounts session and only renders for a user whose token carries the `SA` role in a `Commercial` deployment; anyone else is sent to the Workspace app. The Workspace sidebar no longer links here, so the entry point is `/globaladmin/` on the app host.

## Available Scripts

| Script      | Description                           |
| ----------- | ------------------------------------- |
| `dev`       | Start the Vite dev server (port 3003) |
| `build`     | Type-check and build for production   |
| `typecheck` | Run TypeScript compiler in build mode |
| `lint`      | Run ESLint                            |
| `format`    | Format files with Prettier            |
| `preview`   | Preview the production build          |

## Shared Dependencies

- `@avplatform/ui` - shared UI components, hooks, stores, and API helpers
- `@avplatform/layout` - shared header, logo, and default pages
- `@avplatform/eslint-config`, `@avplatform/typescript-config`, `@avplatform/vite-config`, `@avplatform/tailwind-config` - shared tooling

## Environment Variables

| Variable                   | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| `VITE_GLOBALADMIN_API_URL` | Global Admin API base URL                      |
| `VITE_ACCOUNTS_API_PATH`   | Accounts API base used for session refresh     |
| `VITE_ACCOUNTS_PATH`       | Accounts app path used for login redirects     |
| `VITE_WORKSPACE_PATH`      | Workspace app path for users without GA access |

Per-environment defaults live in `.env.<environment>`: `VITE_GLOBALADMIN_API_URL` is `https://uat-globaladmin.aventisia.com/api` in `staging`, `https://globaladmin.aventisia.com/api` in `production`, and `/globaladmin/api` (the dev proxy) in `development`. Local overrides should go in `.env.<environment>.local`, which is ignored by git.

## Deploying under /globaladmin

- **Web files** - Jenkins rsyncs the build to `/var/www/aventisia.com/clients/global-admin/` (the directory name is unchanged).
- **Routing** - `deploy/nginx/sites-available/aventisia.worc` serves `/globaladmin/` from that directory, and published builds call the Global Admin API cross-origin at the environment's `VITE_GLOBALADMIN_API_URL`, authenticated with the `Authorization: Bearer` header. `deploy/nginx/common_headers.conf` allows both API hosts in `connect-src`, and the API's `CorsOrigins` allows the Accounts app host of each environment. Both files are shared by the two environments, so each allows the other's host until the API is split per environment.
- **Rollout** - the old `/global-admin/` page paths return a temporary `302` to `/globaladmin/`, and the old `/global-admin/api/` proxy is kept until a later change removes it. The API service, container name, and network alias stay `globaladmin`; only the public web path lost its hyphen.
