# Global Admin App

React + Vite application for the Aventisia Avintra Global Admin area.

## Overview

This app is part of the `clients/web-apps` Turborepo monorepo. It manages on-premises tenants, their instances, and the execution data reported by those instances. It replaces the Global Admin section that used to live inside the Workspace app.

## Getting Started

Run from the monorepo root:

```sh
cd clients/web-apps
npm install
npx turbo run dev --filter=global-admin
```

The app runs on port `3003` by default and is served from the root path. In development the dev server proxies `/globaladmin/api` to `http://localhost:4004` and `/accounts/api` to `http://localhost:4000`; published builds are served from the root of the Global Admin host (`https://uat-globaladmin.aventisia.com` in staging, `https://globaladmin.aventisia.com` in production) and call its `/api`.

## Access

Signing in goes through the Accounts app. The app reads the Accounts session and only renders for a user whose token carries the `SA` role in a `Commercial` deployment; anyone else is sent to the Workspace app. The Workspace sidebar no longer links here, so the entry point is the root of the Global Admin host.

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

## Deploying

- **Web files** - Jenkins rsyncs the build to `/var/www/aventisia.com/clients/globaladmin/`, which the Global Admin host serves at its root: `https://uat-globaladmin.aventisia.com` in staging, `https://globaladmin.aventisia.com` in production.
- **Sign-in** - published builds read the Accounts session and API from the app host (`https://uat-avintra.aventisia.com` in staging, `https://avintra.aventisia.com` in production) as absolute URLs, because the app runs on its own host. The Accounts API therefore needs `EXTRA_CORS_ORIGINS` (semicolon-separated) to carry `https://uat-globaladmin.aventisia.com;https://globaladmin.aventisia.com`, and its session cookie stays `SameSite=None; Secure` so the browser sends it cross-site. The Global Admin API is called same-origin and authenticated with the `Authorization: Bearer` header.
