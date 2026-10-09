# Vault table (credentials)

Configure-page feature that lists, creates, updates, shares, and deletes app
credentials. The folder keeps the product label "vault"; the backend and API are
named `AppSecret` (`/app-secret`).

## Data flow

`useFetchVaults` runs two TanStack queries and merges them into one list:

- personal credentials: `GET /app-secret/list`
- credentials shared with the current user: `GET /app-secret/list/shared`

Both queries are keyed by space and environment, so switching space or environment
refetches. The merge keeps the widest status code and concatenates rows.

`VaultTable` renders `VaultTableSkeleton` while either query is loading or refetching
(`isLoading || isFetching`) and only renders the table or the empty state after both
queries have finished, so a partially loaded list never shows as empty.

## Space and environment scoping

The page operates on the current space and environment selected in the workspace shell.
Requests send the space headers (`getSpaceHeaders`); the backend resolves Central
(`SpaceId == null`) versus a specific space and the persisted `EnvType`. PROD
credentials are created/edited/deleted under backend guardrails, and sharing is disabled
for PROD resources.

## Access and sharing

Each row shows its `accessLevel` (`Owner`, `FullAccess`, `View`, `Edit`, `Delete`).
Owned rows expose the full row actions menu, including `ResourceShareDialog` to grant or
revoke access and toggle tenant-wide access. Rows that are shared with the user expose
remove-from-shared-list and reconnect actions. Actions post `ResourceTypeEnum.AppSecret`
to the resource-share flow.

## Corsair OAuth connect flow

OAuth-capable credential types (M365, Google Workspace, and catalog integrations with an
`oauth_2` auth mode) require consent after saving:

1. On submit, the mutation opens a popup inside the user gesture to avoid popup blockers.
2. The API response carries `oauthConnectUrl`; the popup is navigated to it.
3. `useOAuthConnect` polls `GET /app-secret/{id}/oauth-status` (and listens for the
   callback `postMessage`) until consent completes, then the dialog closes.

Row actions allow reconnecting, testing the connection, and deleting.

## Deferred rename

Renaming this feature's files, types, and routes from `vault` to `app-secret` is tracked
as a follow-up and is intentionally out of scope for the current change.
