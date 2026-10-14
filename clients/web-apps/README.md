# Aventisia Web Platform

This is an npm workspaces + Turborepo monorepo for the Aventisia web applications.
It is built with [Vite](https://vitejs.dev), [React](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Tailwind CSS](https://tailwindcss.com), [ESLint](https://eslint.org) and [Prettier](https://prettier.io).

## What's inside?

### Apps

- `apps/accounts` - React + Vite application for accounts/aventisia identity flows.

### Shared packages

- `@avplatform/ui` - shared React component library and utility helpers (`cn`, buttons, loading spinner, etc.).
- `@avplatform/eslint-config` - shared flat ESLint config used by every app/package.
- `@avplatform/typescript-config` - shared `tsconfig.json` presets for Vite apps and Node tooling.
- `@avplatform/vite-config` - shared Vite configuration used by all apps.
- `@avplatform/tailwind-config` - shared Tailwind CSS theme, base styles and PostCSS config.

All shared packages are source-only TypeScript: they are consumed directly by Vite/TypeScript without a separate build step.

## Getting started

```sh
npm install
npm run dev
```

## Available scripts

| Script              | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm run dev`       | Start all apps in development mode with hot reload. |
| `npm run build`     | Type-check and build all apps for production.       |
| `npm run typecheck` | Type-check all packages and apps.                   |
| `npm run lint`      | Lint all packages and apps.                         |
| `npm run format`    | Format all source files with Prettier.              |

## Environment variables

Each app can define per-environment defaults via committed `.env.<environment>` files (e.g. `.env.development`).
**Do not put secrets in committed env files.**

To override values locally without committing, create `.env.<environment>.local` files in the app directory.
These local overrides are ignored by git automatically through the parent repository's `.gitignore`.

### Development server ports

Every app starts on a fixed port and fails fast when that port is taken, instead of silently switching to the next free one:

| App         | Port |
| ----------- | ---- |
| accounts    | 3001 |
| workspace   | 3002 |
| studio      | 3006 |
| atlas       | 3007 |
| desktop-app | 2999 |

Set `VITE_PORT` (shell environment or the app's `.env.development.local`) to run several worktrees side by side:

```sh
VITE_PORT=3101
```

The accounts dev server proxies `/accounts/api` to AccountsAPIs. Point it at a worktree backend listening on another port with `VITE_ACCOUNTS_API_TARGET`, matching `ASPNETCORE_URLS` in the backend's `.env.local` (see `apis/WorcBackend-legacy/AccountsAPIs/README.md`):

```sh
VITE_ACCOUNTS_API_TARGET=http://localhost:5001
```

`desktop-app` starts through `tauri dev`, whose `devUrl` in `src-tauri/tauri.conf.json` is pinned to `localhost:2999`; overriding `VITE_PORT` there requires updating both.

## Adding a new app

1. Create a new directory under `apps/<app-name>`.
2. Add a `package.json` with `"private": true`, `"type": "module"` and declare dependencies on the shared packages you need (`@avplatform/ui`, `@avplatform/vite-config`, `@avplatform/tailwind-config`, `@avplatform/eslint-config`, `@avplatform/typescript-config`).
3. Re-export shared configs:
   - `vite.config.ts` -> `export { default } from "@avplatform/vite-config";`
   - `tailwind.config.ts` -> `import baseConfig from "@avplatform/tailwind-config/tailwind.config";`
   - `postcss.config.js` -> `export { default } from "@avplatform/tailwind-config/postcss.config";`
   - `eslint.config.js` -> `export { default } from "@avplatform/eslint-config";`
4. Add standard scripts: `dev`, `build`, `lint`, `typecheck`, `format`.
5. Add the new app to `turbo.json` task scopes automatically by running any `turbo` command; no manual list is required because Turborepo discovers npm workspaces.
