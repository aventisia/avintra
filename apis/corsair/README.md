# Corsair Sidecar

Express wrapper around the `corsair` SDK that hosts API-key and OAuth plugins for the WORC Platform.

## SECURITY: Internal Only

**This sidecar is backend-only infrastructure and must NOT be exposed to end users or the public internet.**

- No user-facing endpoints or UI — it exists only to manage plugin operations internally.
- Has no authentication layer (relies on network isolation).
- Always deployed in a private network behind the Workspace API proxy.
- All user interactions happen through the Studio UI or the Workspace API (WorkspaceAPIs), never directly with this sidecar.
- End users see only friendly plugin names and descriptions in the action selector; internal "Corsair" branding is stripped from all user-facing text.

## What it does

- Registers Corsair plugins (GitHub, Resend, Tavily, Slack, Stripe, Twilio, Notion, HubSpot, OpenWeatherMap, Outlook).
- Mirrors API-key credentials from the workspace vault via `POST /credentials`.
- Mirrors OAuth client credentials (client id/secret/redirect URL) via `POST /integration-keys`.
- Renders an OAuth consent page at `GET /connect?state=...`.
- Handles the provider OAuth callback at `GET /api/oauth/callback` and stores tokens per tenant.
- Exposes tool invocation via `POST /api/corsair/invoke` (called by the Workspace API only).

## Architecture

Users see only:
- ✅ **Plugin names and descriptions** in the Studio action selector (e.g., "GitHub", "Send an email with Resend")
- ✅ **Action operations** displayed as friendly labels (e.g., "List issues in a repository")

Users do NOT see:
- ❌ The word "Corsair" (internal infrastructure name)
- ❌ HTTP endpoints (all access goes through the Workspace API proxy)
- ❌ OAuth flows (handled silently in the vault configuration)
- ❌ Credential storage details (managed internally)

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values.

| Variable | Purpose |
| --- | --- |
| `PORT` | Sidecar HTTP port. Default `3456`. Keep internal; do NOT expose to public. |
| `APP_URL` | Internal base URL for OAuth consent page. Local dev: `https://local-avintra.aventisia.com/corsair`. |
| `WORKSPACE_APP_URL` | Workspace API URL for OAuth callback redirect. Local dev: `https://local-avintra.aventisia.com/workspace`. |
| `CORSAIR_KEK` | 32-byte hex encryption key for Corsair token storage. |
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
