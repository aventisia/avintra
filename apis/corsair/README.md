# Corsair Sidecar

Express wrapper around the `corsair` SDK that hosts API-key and OAuth plugins for the WORC Platform.

## What it does

- Registers Corsair plugins (GitHub, Resend, Tavily, Slack, Stripe, Twilio, Notion, HubSpot, OpenWeatherMap, Outlook).
- Mirrors API-key credentials from the workspace vault via `POST /credentials`.
- Mirrors OAuth client credentials (client id/secret/redirect URL) via `POST /integration-keys`.
- Renders an OAuth consent page at `GET /connect?state=...`.
- Handles the provider OAuth callback at `GET /api/oauth/callback` and stores tokens per tenant.
- Exposes tool invocation via `POST /corsair/invoke`.

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values.

| Variable | Purpose |
| --- | --- |
| `PORT` | Sidecar HTTP port. Default `3456`. |
| `APP_URL` | Public base URL used for OAuth connect/callback URLs. Local dev: `https://local-avintra.aventisia.com/corsair`. |
| `WORKSPACE_APP_URL` | Workspace frontend URL used to redirect the browser back after OAuth. Local dev: `https://local-avintra.aventisia.com/workspace`. |
| `CORSAIR_KEK` | 32-byte hex encryption key for Corsair token storage. |
| `CORSAIR_API_KEY` | Shared secret callers send in `X-Corsair-Api-Key`. |
| `POSTGRESQL_HOST` / `PORT` / `USERNAME` / `PASSWORD` | Postgres connection for the Corsair SDK tables. |

## OAuth flow

1. User adds an OAuth-capable credential (e.g. M365) in the workspace vault.
2. `WorkspaceAPIs` stores the OAuth client id/secret/redirect URL in the sidecar via `POST /integration-keys`.
3. `WorkspaceAPIs` mints a connect link via `POST /connect/link` and returns `oauthConnectUrl` to the frontend.
4. The frontend opens a popup and navigates to `/connect?state=...`.
5. The sidecar resolves the state and renders a consent page showing the provider name and requested scopes.
6. The user clicks **Connect** and is redirected to the provider (Microsoft for Outlook).
7. The provider redirects back to `/api/oauth/callback` with `?code=...&state=...`.
8. The sidecar exchanges the code for tokens, stores them per tenant, and redirects the popup to `WORKSPACE_APP_URL/configure/vault/oauth-callback?oauth_success=true&plugin=...&credentialId=...`.
9. The frontend polls `POST /connect/status` until `connected: true`.

## Adding a new OAuth plugin

1. Install the Corsair plugin package and add it to `src/corsair.ts`.
2. Add the `AppSecretTypesEnum` → plugin mapping in `WorkspaceAPIs/Features/Orchestrator/AppSecret/Service/AppSecretService.cs` (`MapAppSecretTypeToCorsairOAuthPlugin`).
3. Add a frontend form config JSON under `clients/web-apps/apps/workspace/src/features/dynamic-config-panel/constants/config-json/` with the fields the plugin needs (usually `ClientId` and `ClientSecret`).
4. Ensure `AppSecretService.MirrorOAuthCredentialToCorsairAsync` sends those fields to `POST /integration-keys`.

## Development

```sh
cd apis/corsair
npm install
npm run migrate
npm run dev
```

## Verification

```sh
npm run typecheck
```

Run the Bruno collection under `tests/bruno/Corsair/` for API-level checks.
