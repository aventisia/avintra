# Atlas

Atlas is the Avintra application launcher — a single-page grid view that links to the
various Avintra applications (Agents, Sales, Projects, HR, Legal, Operations).

## Overview

- **Single page grid view** with sample cards linking to protected routes.
- **All routes are protected** by the access token. There are no open/public routes.
  Session validation happens in `AppLayout` via `useValidateUserSession`, which refreshes
  the user session on app-load. If the session is invalid/expired, the shared axios
  instance handles the `401` and redirects the user to the login page.

## Development

```sh
npx turbo run dev --filter=atlas   # port 3007
npx turbo run build --filter=atlas
npx turbo run lint --filter=atlas
```

## Structure

```
apps/atlas/
├── react-toolkit/          # session validation hook
├── src/
│   ├── components/layout/  # AppLayout, AppHeader, AppLoader, etc.
│   ├── pages/              # HomePage (grid view), NotFoundPage
│   ├── stores/             # app-loader-store
│   ├── App.tsx             # router (all routes protected)
│   └── main.tsx
├── .env.*                  # environment variables
└── vite.config.ts          # base path /atlas/
```
