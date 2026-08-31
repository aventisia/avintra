# Desktop App

Tauri-based cross-platform desktop application for the Aventisia WORC Platform.

## Overview

This app is part of the `clients/web-apps` Turborepo monorepo. It wraps a React + TypeScript + Vite frontend inside a [Tauri](https://tauri.app/) v2 shell. It is the desktop client for the Aventisia platform and can communicate with local or remote backend services.

The app was ported from the standalone `clients/desktop-app` folder into the monorepo so it shares the same React setup and design system (`@avplatform/ui`) as the other web apps.

## Getting Started

Run from the monorepo root:

```sh
cd clients/web-apps
npm install
npm run dev
```

The desktop app runs on port `2999` by default (matching `src-tauri/tauri.conf.json` `devUrl`).

## Tauri Development

```sh
cd clients/web-apps/apps/desktop-app
npm run tauri dev
```

## Build for Production

```sh
cd clients/web-apps/apps/desktop-app
npm run tauri build
```

Build artifacts (including the NSIS installer) are placed in `src-tauri/target/release/bundle/`. The `.bat` scripts in this folder (`01-tauri-build.bat`, `02-tauri-non-prod-push.bat`, `03-tauri-prod-push.bat`) automate the build, code-signing, and `scp` push to the dev/uat/prod servers.

## Available Scripts

| Script      | Description                                   |
| ----------- | --------------------------------------------- |
| `dev`       | Start the Vite dev server (port 2999)         |
| `build`     | Type-check and build the web assets           |
| `typecheck` | Run TypeScript compiler in build mode         |
| `lint`      | Run ESLint                                    |
| `format`    | Format files with Prettier                    |
| `preview`   | Preview the production build                  |
| `tauri`     | Tauri CLI wrapper (`npm run tauri dev`, etc.) |

## Shared Dependencies

This app imports shared packages from the monorepo:

- `@avplatform/ui` — shared UI components
- `@avplatform/layout` — shared layout components
- `@avplatform/tauri-utils` — Tauri bridge helpers
- `@avplatform/eslint-config`, `@avplatform/typescript-config`, `@avplatform/vite-config`, `@avplatform/tailwind-config` — shared tooling

## Notes

- Tauri v2 is used for the application shell.
- The `invoke()` calls (`launch_runner_app`, `get_user_metadata`) are guarded by a Tauri-detection check so the app also runs in a plain browser. The runner is provisioned (downloaded/updated) when the desktop app opens; flow execution only launches it.
- The bundled `ui-inspector` binary is built from `clients/UIInspector` (its post-build step copies to `src-tauri/binaries/ui-inspector/`). The runner binary is not bundled — it is downloaded/updated from the server by `runner_management.rs` and published via `clients/RunnerApp` publish scripts.
