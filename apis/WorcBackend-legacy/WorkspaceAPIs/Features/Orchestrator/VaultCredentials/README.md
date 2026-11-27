# VaultCredential

Backend credential store for the Workspace app. The product feature is the "Vault"
page; the persisted record is a vault credential.

## API surface

`VaultCredentialController` exposes `[Route("vault-credential")]`:

| Method | Route | Purpose |
| ------ | ----- | ------- |
| `GET` | `list` | Personal credentials for the current user. |
| `GET` | `list/shared` | Credentials shared with the current user. |
| `POST` | `is-available` | Name-availability check for create/rename. |
| `GET` | `option-to-select` | Credential options for dropdowns. |
| `GET` | `{vaultCredentialId}` | Credential metadata by id. |
| `GET` | `by-name/{vaultCredentialName}` | Credential metadata by name. |
| `POST` | `` | Create. |
| `PUT` | `` | Update. |
| `DELETE` | `{vaultCredentialId}` | Delete one. |
| `POST` | `delete-multiple` | Delete many. |
| `GET` | `decrypted-data/{vaultCredentialId}` | Metadata plus decrypted key-values. |
| `GET` | `decrypted-data/by-name/{vaultCredentialName}` | Metadata plus decrypted key-values by name. |
| `POST` | `{vaultCredentialId}/connect-link` | Mint a Corsair OAuth connect link. |
| `GET` | `{vaultCredentialId}/oauth-status` | Corsair OAuth connection status. |
| `POST` | `{vaultCredentialId}/connection-test` | Corsair credential connection test. |

## Scoping invariants

- **Tenant**: every row carries `TenantId`; queries are tenant-filtered.
- **Central vs space**: `SpaceId == null` is the tenant-wide "Central" space. The
  `WorkspaceDbContext` query filter scopes reads to `CurrentSpaceId`: `Guid.Empty`
  resolves to `SpaceId == null`, any other value resolves to `SpaceId == CurrentSpaceId`.
  `WorkspaceDbContext` auto-stamps `SpaceId` on save from the current request context.
- **Environment**: `EnvType` (`ConfigureEnvironmentType`) is part of the identity of a
  credential. New rows default to `Dev` and persist the current tenant environment.
- Credentials are resolved by name in tenant-wide flows (triggers, connectors, Corsair);
  those lookups bypass the space filter and resolve deterministically (request space,
  then Central, then oldest).

## Uniqueness

A database unique index exists on `(TenantId, SpaceId, EnvType, Name)`, but the service
enforces a **tenant-wide** rule on `(TenantId, EnvType, Name)`: a name cannot be reused
in any space of the same tenant and environment. Create/update therefore query with
`IgnoreQueryFilters()` to check every space.

## Access and sharing

`IsTenantWideAccess` exposes a credential to all users in the tenant. Otherwise access is
controlled through `ResourceUserAccess` rows keyed by `ResourceTypeEnum.VaultCredential`, with
`ResourceAccessTypeEnum` levels (`Owner`, `FullAccess`, `View`, `Create`, `Edit`,
`Delete`). Personal lists mark owned rows `Owner`; shared lists resolve the grant through
`IResourceUserAccessService.GetResourceAccessAsync`. Delete operations also remove the
credential's `ResourceUserAccess` rows.

Agent access uses the shared flow-access list (`agent_ResourceFlowAccess`, keyed by
`ResourceTypeEnum.VaultCredential`). Saving a non-empty agent list restricts the credential
(`IsResourceAccessRestricted`) to exactly those agents; saving an empty list is the only way
to open it again. Publishing an agent that references a restricted credential it is not
assigned to fails at publish time. Production clones copy the flag and gain missing
flow-access rows add-only. Delete operations also remove the credential's flow-access rows.

## Environment guardrails

PROD rules are enforced in the service via shared guards:

- `CreateResourceGuard` blocks creating credentials in PROD.
- `ProdResourceUpdateGuard` blocks editing a PROD credential.
- `DeleteResourceGuard` blocks deleting a PROD credential, including a non-PROD twin
  that shares the same name as a PROD credential.

## Corsair mirroring

Credentials that map to Corsair plugins are mirrored to the Corsair sidecar on create
and update (best-effort). API-key plugins store the secret value; OAuth-capable types
store tenant-scoped integration keys and require a consent flow:

- Create/update returns an `oauthConnectUrl` for OAuth-capable types.
- The frontend opens the URL and polls `oauth-status` until consent completes.
- `VaultCredential.Id` is used as the Corsair connection/tenant handle.
- `SyncCredentialToCorsairAsync` re-syncs a credential that was inserted directly
  (for example during Production publish cloning).

Types are supported through `CorsairConfigRepository` plugin mappings; the
"VaultCredentialType"/"Vault credential" terminology in Corsair/CloudConnectors code refers to a
credential type, not a legacy entity.

### Per-credential OAuth registration and per-service types

Each OAuth credential now owns its provider plugin instance
(`<plugin>__<credential-id>`), so saving one credential never changes another
credential's OAuth app registration. `VaultCredential.LegacyFamilyAccess` records
credentials saved before this isolation:

- The `ApplyVaultCredentialFlattening` migration renames `M365` to `Outlook` and
  `GoogleWorkspace` to `Gmail`, and sets `LegacyFamilyAccess = true` on those rows plus
  the untouched `Teams`, `Onedrive`, `Sharepoint` and `SendGrid` rows.
- A flagged credential keeps the previous family-wide plugin access when invoked (all
  four Microsoft services, all Google services), because its tokens live on the family's
  base plugin instance. New credentials get only their own service.
- `CorsairOAuthAliasBackfillHostedService` runs at startup and asks the sidecar to copy
  each credential's legacy base-plugin tokens onto its own instance, so existing OAuth
  connections keep working without a reconnect.

Vault credential types map one-to-one to Corsair plugins (`Outlook`, `Teams`,
`Onedrive`, `Sharepoint`, `Gmail`, `Googlecalendar`, ...). The retired family names
(`M365`, `GoogleWorkspace`) stay in the generated type map for stored rows and rollback
but are not offered for new credentials: create refuses them, and update refuses a type
change to them, while rename/data edits on an existing row of that type still work.

## Persistence and compatibility

`VaultCredential` owns `EncryptedKeyValue` rows (cascade delete) that hold the encrypted
secret fields; the `Data` column stores the sanitized JSON payload.

Legacy `ResourceType` strings persisted before this rename (the former credential and
`Vault` values) are backfilled to `VaultCredential` by the
`RenameAppSecretToVaultCredential` migration. The legacy `Vault` entity, its table
(`Vaults`), controller, service, repo, and DTO were removed; the `RemoveVaultEntity`
migration drops the table.
