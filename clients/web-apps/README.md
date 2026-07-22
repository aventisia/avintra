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

| Script | Description |
| --- | --- |
| `npm run dev` | Start all apps in development mode with hot reload. |
| `npm run build` | Type-check and build all apps for production. |
| `npm run typecheck` | Type-check all packages and apps. |
| `npm run lint` | Lint all packages and apps. |
| `npm run format` | Format all source files with Prettier. |

## Environment variables

Each app can define per-environment defaults via committed `.env.<environment>` files (e.g. `.env.development`).
**Do not put secrets in committed env files.**

To override values locally without committing, create `.env.<environment>.local` files in the app directory.
These local overrides are ignored by git automatically through the parent repository's `.gitignore`.

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
