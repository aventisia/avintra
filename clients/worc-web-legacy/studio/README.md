# Legacy Studio Web App

React + TypeScript + Vite application for the Aventisia studio / flow-builder experience.

## Overview

This is the **legacy** studio client used by the avplatform deployment. It is served as static files through the Nginx frontend container (`deploy/nginx`).

## Getting Started

```sh
cd clients/worc-web-legacy/studio
npm install --force
npm run dev
```

The dev server runs on port `3006`.

## Build for Production

```sh
npm run build
```

Static output is written to `dist/` and copied into the Nginx image by `deploy/nginx/Dockerfile`.

## Project Scripts

| Script      | Description                            |
| ----------- | -------------------------------------- |
| `dev`       | Start the Vite dev server (port 3006)  |
| `build`     | Type-check and build for production    |
| `format`    | Run Prettier and ESLint --fix          |
| `lint`      | Run ESLint                             |
| `preview`   | Preview the production build             |

## Notes

- This app is part of the legacy frontend suite alongside `accounts` and `workspace`.
- `--force` may be required during install to resolve legacy peer dependencies.
- For the modern web-apps monorepo, see `clients/web-apps/`.
