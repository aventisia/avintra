# Workspace App

React + Vite application for the Aventisia workspace and flow-builder experience.

## Overview

This app is part of the `clients/web-apps` Turborepo monorepo. It provides the main workspace where users build, manage, and execute automation flows, interact with AI assistants, and manage project resources.

## Getting Started

Run from the monorepo root:

```sh
cd clients/web-apps
npm install
npm run dev
```

The workspace app runs on port `3002` by default.

## Available Scripts

| Script          | Description                                     |
| --------------- | ----------------------------------------------- |
| `dev`           | Start the Vite dev server (port 3002)           |
| `build`         | Type-check and build for production               |
| `typecheck`     | Run TypeScript compiler in build mode           |
| `lint`          | Run ESLint                                      |
| `format`        | Format files with Prettier                      |
| `preview`       | Preview the production build                    |

## Shared Dependencies

This app imports shared packages from the monorepo:

- `@avplatform/ui` — shared UI components
- `@avplatform/layout` — shared layout components
- `@avplatform/ui-editors` — rich-text / code editor components
- `@avplatform/tauri-utils` — Tauri bridge helpers
- `@avplatform/eslint-config`, `@avplatform/typescript-config`, `@avplatform/vite-config`, `@avplatform/tailwind-config` — shared tooling

## Environment Variables

Per-environment defaults can be committed in `.env.<environment>` files. Local overrides should go in `.env.<environment>.local` and are ignored by git.

## Notes

- For shared component documentation, see `clients/web-apps/packages/ui/README.md`.
- For the overall monorepo setup, see `clients/web-apps/README.md`.
