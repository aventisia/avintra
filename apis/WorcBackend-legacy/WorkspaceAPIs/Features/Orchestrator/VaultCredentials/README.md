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

## Persistence and compatibility

`VaultCredential` owns `EncryptedKeyValue` rows (cascade delete) that hold the encrypted
secret fields; the `Data` column stores the sanitized JSON payload.

Legacy `ResourceType` strings persisted before this rename (the former credential and
`Vault` values) are backfilled to `VaultCredential` by the
`RenameAppSecretToVaultCredential` migration. The legacy `Vault` entity, its table
(`Vaults`), controller, service, repo, and DTO were removed; the `RemoveVaultEntity`
migration drops the table.

## Tenant-level credentials

A credential has a `Scope` (`VaultCredentialScopeEnum`): `Space` (the default, everything above) or
`Tenant`. Invariant: a `Tenant` row has `EnvType == Any` and `SpaceId == null`, and is not a Central row.

- The `WorkspaceDbContext` query filter excludes `Tenant` rows, and the `SpaceId` stamp on save skips them, so no
  space list, picker, by-id or decrypt endpoint on `VaultCredentialController` can see one. Code that must see them
  (tenant endpoints, provider credential resolution, StreamingChat) uses `IgnoreQueryFilters()` and filters on `Scope`.
- Admin endpoints live on `TenantVaultCredentialController` (`tenant-vault-credential`, role `TA`): `list`,
  `option-to-select`, `is-available`, `POST`, `PUT`, `DELETE {id}`. AI model provider types only
  (`IsAllowedTenantCredentialType`: a `LLMProviderTypesEnum` name or `GoogleGemini`, with no Corsair OAuth plugin).
- Uniqueness: a tenant name is unique among tenant credentials and against every Dev/Prod/space credential of the
  tenant, and the other way round. Update never changes a name.
- Delete is blocked while a `TenantModelProvider` references the credential (`CredentialId`); the message names the provider.
- `TenantResolver.ResolveEnvType` accepts only a trimmed, case-insensitive `dev` or `prod`; anything else is Dev, so a
  forged env header cannot reach `Any`.
- Decrypt: a tenant secret is returned only by `decrypted-data/by-name/{name}` and only with a valid `X-Model-Call-Token`
  (`ModelCallTokenHelper`: HS512, signed with `JWT_SECRET_KEY`, `iss` `https://{APP_BASE_URL}`, `aud`
  `https://{APP_BASE_URL}/model-credential`, claim `cred` = the name, 60 s). The LLM pipeline mints it only for model calls
  (`model_call=True` in `vault_credential_manager.py`), and the token reaches only a credential that an enabled
  `TenantModelProvider` uses (`TenantCredentialAccessEnum.ProviderCredentials`); the tenant admin's model list in the
  provider dialog reads any tenant credential (`All`). Otherwise the response is identical to a missing name.
- Provider credential id-to-name resolution (StreamingChat, `TenantModelProviderService`) goes through
  `IVaultCredentialRepo.GetProviderCredentialNamesAsync`.
- Older provider rows keep their space credential (shown as "legacy"). Roll back by deleting the tenant rows and
  reverting the migration `AddScopeToVaultCredentials`; existing credentials are untouched.

