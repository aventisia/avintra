# Vault credentials

Configure-page feature that lists, creates, updates, shares, and deletes vault
credentials. The product label is "vault"; the backend feature, entity, and route are
`VaultCredential` (`/vault-credential`).

## Data flow

`useFetchVaultCredentials` runs two TanStack queries and merges them into one list:

- personal credentials: `GET /vault-credential/list`
- credentials shared with the current user: `GET /vault-credential/list/shared`

Both queries are keyed by space and environment, so switching space or environment
refetches. The merge keeps the widest status code and concatenates rows.

`VaultCredentialTable` renders `VaultCredentialTableSkeleton` while either query is loading or refetching
(`isLoading || isFetching`) and only renders the table or the empty state after both
queries have finished, so a partially loaded list never shows as empty.

## Space and environment scoping

The page operates on the current space and environment selected in the workspace shell.
Requests send the space headers (`getSpaceHeaders`); the backend resolves Central
(`SpaceId == null`) versus a specific space and the persisted `EnvType`. PROD
credentials are created/edited/deleted under backend guardrails; sharing them works in
PROD, so owners can add people, change or remove access, toggle tenant-wide access, and a
shared user can leave.

## Access and sharing

Each row shows its `accessLevel` (`Owner`, `FullAccess`, `View`, `Edit`, `Delete`).
Owned rows expose the full row actions menu, including `ResourceUserAccessDialog` to grant or
revoke access and toggle tenant-wide access, in Dev and PROD alike. Rows that are shared with
the user expose remove-from-shared-list and reconnect actions. Actions post
`ResourceTypeEnum.VaultCredential` to the resource-user-access flow.

Rows also expose `Assign Agents`, which opens the shared flow-assignment dialog. A non-empty
list restricts the credential to those agents and an empty list opens it again; the action
stays disabled on PROD rows.

## Corsair OAuth connect flow

OAuth-capable credential types (M365, Google Workspace, and catalog integrations with an
`oauth_2` auth mode) require consent after saving:

1. On submit, the mutation opens a popup inside the user gesture to avoid popup blockers.
2. The API response carries `oauthConnectUrl`; the popup is navigated to it.
3. `useOAuthConnect` polls `GET /vault-credential/{id}/oauth-status` (and listens for the
   callback `postMessage`) until consent completes, then the dialog closes.

Row actions allow reconnecting, testing the connection, and deleting.
