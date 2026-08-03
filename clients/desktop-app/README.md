# Desktop App

Tauri-based cross-platform desktop application for the Aventisia WORC Platform.

## Overview

This application wraps a React + TypeScript + Vite frontend inside a [Tauri](https://tauri.app/) shell. It is the desktop client for the Aventisia platform and can communicate with local or remote backend services.

## Getting Started

```sh
cd clients/desktop-app
npm install
npm run tauri dev
```

## Build for Production

```sh
npm run tauri build
```

Build artifacts (including the NSIS installer) are placed in `src-tauri/target/release/bundle/`. The legacy `AccountsAPIs` Dockerfile copies the NSIS bundle into the runtime image at `/var/www/aventisia.com/files/binaries/`.

## Project Scripts

| Script    | Description                                   |
| --------- | --------------------------------------------- |
| `dev`     | Start the Vite dev server (port 2999)         |
| `build`   | Type-check and build the web assets           |
| `lint`    | Run ESLint                                    |
| `preview` | Preview the production build                  |
| `tauri`   | Tauri CLI wrapper (`npm run tauri dev`, etc.) |

## Notes

- Tauri v2 is used for the application shell.
- The bundled `node-executor` binary is provided by `clients/NodeExecutor/NodeExecutor` (post-build copy to `src-tauri/binaries/`).
