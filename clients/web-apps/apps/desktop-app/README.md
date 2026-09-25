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

Build artifacts are placed in `src-tauri/target/release/bundle/`. To build **and** push installers to the uat/prod servers, use the per-platform publish scripts in `scripts/<platform>/` — they handle version sync, signing, and upload interactively:

```sh
# macOS (developer machine) — DMG + auto-update artifacts
./scripts/publish-and-upload-macos.sh --target-servers uat

# Windows (Windows developer machine) — NSIS installer + EV code-signing on prod
.\scripts\publish-and-upload-windows.ps1 -TargetServers uat

# Linux (Linux developer machine) — AppImage (+ optional deb)
./scripts/publish-and-upload-linux.sh --target-servers uat
```

### Target server options

The scripts prompt for the operation mode and target server(s) when
`--mode` / `-Mode` or `--target-servers` / `-TargetServers` are omitted:

Operation modes (`--mode` / `-Mode`):

1. `both` — publish and upload (default)
2. `publish` — build only, no upload; the server prompt is skipped entirely
3. `upload` — no build; upload the existing artifacts for the configured version

Choosing `publish` skips server selection — nothing is uploaded. On Windows
prod, EV code-signing is applied at upload time (upload-only signs the
installer if it is not already signed).

Target servers (`--target-servers` / `-TargetServers`):

1. `uat` → `avuat.aventisia.com`
2. `prod` → `avweb1.aventisia.com`
3. `both` → uat + prod

All scripts upload installers and updater signatures to `/var/www/aventisia.com/files/binaries/` (via `ssh admin@<host>`).

### Signing secrets

The scripts load signing configuration from `scripts/.env.local` (gitignored). Copy the template and fill it in once per machine:

```sh
cp scripts/.env.local.example scripts/.env.local
```

Required keys: `TAURI_SIGNING_PRIVATE_KEY`, `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (all platforms — generate updater `.sig` files). Windows prod additionally needs `WINDOWS_SIGNTOOL_PATH`, `WINDOWS_CERT_PATH`, `WINDOWS_KMS_KEYRING` (EV code-signing via Google Cloud KMS).

### What each platform produces

| Platform | End-user installer                                                    | Auto-update artifacts                                 |
| -------- | --------------------------------------------------------------------- | ----------------------------------------------------- |
| Windows  | `AvintraDesktopApp_<ver>-x64-setup.exe` (NSIS)                        | `.exe.sig`                                            |
| macOS    | `AvintraDesktopApp_<ver>_<arch>.dmg` (drag-to-Applications)           | `.app.tar.gz` + `.app.tar.gz.sig`                     |
| Linux    | `AvintraDesktopApp_<ver>_linux-x64.AppImage` (chmod +x, double-click) | `.AppImage.sig` (optional `.deb` via `--include-deb`) |

### Common flags

| Flag                                                  | Effect                                            |
| ----------------------------------------------------- | ------------------------------------------------- |
| `--mode both\|publish\|upload` / `-Mode`              | Publish+upload / publish only / upload only       |
| `--target-servers uat\|prod\|both` / `-TargetServers` | Skip the interactive server prompt                |
| `--dry-run` / `-WhatIf`                               | Print the plan without building/uploading         |
| `--no-sync-version` / `-NoSyncVersion`                | Skip the `scripts/release-version.*` git-tag sync |
| `--include-deb` (Linux)                               | Also upload the `.deb` package                    |
| `-SkipSign` (Windows prod)                            | Skip EV code-signing (not recommended for prod)   |

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
