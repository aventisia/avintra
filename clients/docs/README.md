# Aventisia Documentation Site

Nextra-based documentation site for the Aventisia Avintra.

## Overview

This Next.js application renders the product documentation at `https://docs.aventisia.com`. Content is authored as Markdown/MDX pages and organized with Nextra's docs theme.

## Getting Started

```sh
cd clients/docs
npm install
npm run dev
```

The dev server runs on port `3004`.

## Build for Production

```sh
# Standard build
npm run build

# Environment-specific builds
npm run build:staging
npm run build:production
```

The `postbuild` step runs [Pagefind](https://pagefind.app/) to generate a static search index under `out/_pagefind/`.

## Available Scripts

| Script             | Description                              |
| ------------------ | ---------------------------------------- |
| `dev`              | Start the Next.js dev server (port 3004) |
| `build`            | Build for production                     |
| `build:staging`    | Build using `.env.staging`               |
| `build:production` | Build for production environment         |
| `postbuild`        | Generate Pagefind search index           |
| `start`            | Start the production server (port 3004)  |
| `lint`             | Run Next.js lint                         |

## Notes

- Do not commit secrets in `.env.*` files.
- Static output is placed in `out/` by the configured Next.js export.
