# Corsair Sidecar

Internal-only sidecar for Avintra. It hosts plugin-backed tool execution and OAuth credential handling for optional external providers, while keeping the main Workspace API deployment independent from provider-specific lifecycle concerns.

## Security and ownership boundary

This sidecar is not a public app and is not part of the core platform bootstrap.

- Internal-only deployment: it must run behind the private network boundary and must not be exposed to end users.
- No user-facing UI: all actions are mediated through the Workspace API and Studio UI.
- No runtime coupling in the main app: the Workspace API should not seed Corsair-owned tools at startup.
- Corsair owns its own metadata generation and deployment assets, not the main app.

The architectural rule is:

- Workspace API owns core platform defaults only.
- Corsair owns provider-specific metadata, action definitions, and generated artifacts.
- Workspace API consumes those artifacts only when they are present.

## What this sidecar does

The sidecar is responsible for three distinct responsibilities:

1. Runtime plugin execution
   - exposes the registered Corsair plugin tools through the internal middleware
   - mirrors tenant-scoped API key credentials
   - handles OAuth credential registration and token lifecycle
   - invokes provider actions on behalf of the Workspace API

2. Internal OAuth integration
   - creates tenant OAuth links for supported providers
   - resolves and stores OAuth client metadata
   - receives callback redirects and persists connection state
   - keeps provider credentials isolated per tenant

3. Sidecar-owned metadata generation
   - introspects the registered plugins and emits static Cloud Connector metadata
   - writes action configuration JSON, action selector mappings, and OpenAPI specs
   - publishes these generated artifacts into the Workspace API ConfigFiles folder
   - allows the main app to read static metadata without depending on a running Corsair process

## Deployment model

Corsair owns its complete deployment lifecycle including metadata generation and tool registry seeding. The main app remains decoupled.

This sidecar follows this sequence:

1. **generate:configs** — introspect plugins and generate static metadata artifacts
2. **migrate** — create Corsair database schema (CorsairDb)
3. **seed:tools** — seed generated Corsair tools into the Workspace database (ai_Tools table)
4. **start** — run the sidecar runtime for OAuth and invocation

This preserves a clean split:

- **Workspace API**: owns core platform defaults and bootstrap; does not seed Corsair tools
- **Corsair sidecar**: owns plugin runtime, metadata generation, and tool registry seeding

If Corsair deployment is skipped, the Workspace API continues to function using its own platform defaults.

## Runtime API surface

The sidecar runs as an internal Express service and exposes the following backend flows:

- POST /credentials: store or mirror API-key credentials for a tenant/plugin
- POST /integration-keys: register OAuth client metadata
- POST /connect/link: mint a provider connection URL for a tenant
- POST /connect/status: check whether a tenant is connected
- GET /connect: resolve the OAuth consent state and redirect to the provider
- GET /api/oauth/callback: complete the OAuth authorization flow and store tokens
  (reached by the browser via the Workspace API proxy at /api/integration/oauth-callback)
- POST /api/corsair/invoke: execute a plugin tool via the Workspace API boundary
- GET /api/corsair/tools: introspect available operations for debugging and generation

The sidecar is not intended to be called directly by browser clients or end users.

## Config generation workflow

The generator is intentionally sidecar-owned and independent from the Workspace API startup flow.

Typical local flow:

```sh
cd apis/corsair
npm install
npm run generate:configs
```

This script reads the in-process Corsair plugin registry and writes generated files, including:

- Corsair action configuration files
- Corsair action selector mapping
- global mapping cleanup to avoid stale provider entries
- action map metadata for backend lookup
- per-plugin OpenAPI specs

### Output location

The generator splits its output between the Workspace API codebase ConfigFiles folder and a deploy dir:

```sh
npm run generate:configs
```

- **Small sibling artifacts** always go to the Workspace API codebase ConfigFiles folder: `Features/CloudConnectors/ConfigFiles/` (`CorsairActionMap.json`, `CorsairIntegrationCatalog.json`, `CorsairVaultCredentialTypeToPluginId.json`). These are committed and deploy with the Workspace API.
- **Corsair action-selector mapping + per-plugin configs** (the thousands of `{Plugin}/{Action}.json` files + OpenAPI specs) go to `CORSAIR_CONFIG_DIR` when set (server deploy dir, e.g. `/var/www/aventisia.com/files/configs/Corsair`). When unset (local dev) the mapping file falls back to `Features/CloudConnectors/ConfigFiles/` and the per-plugin configs to `Features/CloudConnectors/ConfigFiles/Corsair/`, which every dev shares. These are **not** committed — they are rsynced to the shared server files path by Jenkins.

The Workspace API serves per-plugin configs from the shared server path derived from the configured upload directory (`AppDefaultConfig:FileUploadConfig:UploadDirectory` → `.../files/configs/Corsair`) when present, falling back to the codebase folder locally. The committed sibling artifacts are always read from the codebase ConfigFiles folder.

The global `CloudConnectorActionSelectorMappingFile.json` (owned by the Workspace API) is cleaned of any stale Corsair entries in the same folder.

The generator entry point is:

- src/generate-corsair-configs.ts

The generation orchestrator is:

- src/dcp-generator/index.ts

## Environment variables

Copy .env.example to .env.local and set real values before running the service.

| Variable                 | Purpose                                                                                                           |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| PORT                     | Internal sidecar port. Default is 4006.                                                                           |
| CORSAIR_KEK              | 32-byte hex encryption key used for token storage.                                                                |
| APP_BASE_URL             | Public app base domain (without scheme). Used to derive the workspace app URL used for redirecting OAuth results. |
| POSTGRESQL_HOST          | Postgres host for the sidecar database.                                                                           |
| POSTGRESQL_PORT          | Postgres port. Default 5432.                                                                                      |
| POSTGRESQL_USERNAME      | Postgres username.                                                                                                |
| POSTGRESQL_PASSWORD      | Postgres password.                                                                                                |
| ACCOUNTS_API_BASE_URL    | Accounts API base URL (informational, kept in sync with other services).                                          |
| WORKSPACE_API_BASE_URL   | Internal Workspace API base URL (backend-to-backend calls). Browser-facing OAuth URLs are derived from `APP_BASE_URL`, never from this value. |
| LLMPIPELINE_API_BASE_URL | LLM pipeline API base URL (informational).                                                                                                |
| CORSAIR_REDIRECT_URI     | Optional explicit public redirect URI for OAuth callbacks. Must match the backend's `CORSAIR_REDIRECT_URI` and the Workspace API proxy route `/api/integration/oauth-callback`. Default derived from `APP_BASE_URL`. |

## Local development

```sh
cd apis/corsair
npm install
npm run dev           # Runs: migrate → generate:configs → dev server
```

The `predev` hook automatically runs `migrate` and `generate:configs`, so you only need one command.

Standalone commands:

```sh
npm run generate:configs  # Generate metadata artifacts only
npm run seed:tools        # Seed Corsair tools into Workspace database (optional locally)
```

To validate generator output and validation helpers:

```sh
npm test
```

## Deployment sequence

When deploying the Corsair sidecar, follow this order:

1. Ensure environment variables are set:
   - Corsair database: `POSTGRESQL_HOST`, `POSTGRESQL_PORT`, `POSTGRESQL_USERNAME`, `POSTGRESQL_PASSWORD`
   - Workspace database: `WORKSPACE_POSTGRES_HOST`, `WORKSPACE_POSTGRES_PORT`, `WORKSPACE_POSTGRES_USERNAME`, `WORKSPACE_POSTGRES_PASSWORD`
   - Admin user: `ON_PREM_ADMIN_EMAIL`
   - Sidecar config: `PORT`, `APP_BASE_URL`, `CORSAIR_KEK`

2. Build and deploy:
   ```sh
   npm run build              # Compile TypeScript
   npm run generate:configs   # Generate config artifacts (mapping/siblings committed; per-plugin configs to CORSAIR_CONFIG_DIR)
   npm run migrate:prod       # Create Corsair database schema
   npm run seed:tools:prod    # Seed Corsair tools into Workspace database (explicit CI/CD step)
   npm run start:prod         # Run the compiled server (node dist/main.js)
   ```

   > **Do not use `npm start` in production.** `start` runs `tsx src/main.ts`, and
   > `tsx` is a devDependency that is not installed by `npm ci --omit=dev`.
   > `start:prod` runs the compiled `dist/main.js` instead.

   The mapping + sibling config artifacts are committed and deploy with the
   Workspace API. The thousands of per-plugin configs are generated into
   `CORSAIR_CONFIG_DIR` (set by Jenkins) and rsynced to the shared server files
   path (`/var/www/aventisia.com/files/configs/Corsair`). They are not generated
   inside the sidecar container at runtime.

**Important — `generate:configs` and `seed:tools` are intentionally NOT part of
`prestart`.** Config generation is an explicit CI/CD step (Jenkins `Generate -
Corsair Configs` stage) because the per-plugin configs are deployed to the shared
server files path, not generated at runtime. `seed:tools` is also explicit
because it writes into the **Workspace database** (`ai_Tools`), which is owned by
the Workspace API — not the sidecar. The sidecar's runtime (OAuth,
`/api/corsair/invoke`) does not depend on either, so coupling them to startup
would block the sidecar if the Workspace DB is temporarily unavailable.

- `prestart` runs only sidecar-local steps: `migrate` (Corsair DB). It never
touches the Workspace DB and does not regenerate configs.
- `predev` (local dev only) runs `migrate` + `generate:configs` so a single
`npm run dev` is enough.
- `generate:configs` and `seed:tools` must be run explicitly in CI/CD **after**
the Workspace database is up and migrated.

All seeding steps are idempotent and safe to run repeatedly.

## Adding a new plugin

Corsair is an evolving upstream project (`corsairdev/corsair`). New integration
plugins are added to its `packages/` directory over time. The onboarding tool
(`src/check-new-plugins.ts`) compares the upstream plugin set against the
plugins this sidecar depends on and provisions new ones end-to-end.

### Check for new upstream plugins

```sh
cd apis/corsair
npm run plugins:check
```

This fetches the live upstream `packages/` listing from the GitHub API, diffs it
against the `@corsair-dev/*` dependencies in `package.json`, and prints the NEW
plugins our codebase does not have yet.

### Onboard a plugin

```sh
# Onboard a single plugin
npm run plugins:onboard -- <plugin-id>

# Onboard every missing plugin
npm run plugins:onboard -- --all
```

> **Note:** the `--` before the plugin id is required — it tells npm to pass the
> arguments through to the script. Without it, npm may swallow the flags.

The onboard command provisions a plugin:

1. **package.json** — adds the `@corsair-dev/<id>` dependency (alphabetical).
2. **src/plugins.ts** — registers the import + factory instantiation.

No base URL is added. Corsair tools are platform tools (the test/playground is
hidden for them) and execution goes through the Corsair sidecar, so a base URL
is unnecessary and would only introduce false data.

Config regeneration and tool seeding are **not** part of onboarding — they are
separate scripts you run explicitly afterwards:

```sh
npm run generate:configs   # regenerate action configs, mapping, action map, catalog, OpenAPI
npm run seed:tools         # seed the tools into the Workspace ai_Tools database
```

### After onboarding

1. **Run `npm install`** (with `--legacy-peer-deps`) if new deps were added.
2. **Run `npm run generate:configs`** to refresh the configs/mapping/catalog/OpenAPI.
3. **Run `npm run seed:tools`** to seed the tools into `ai_Tools`.
4. **Commit** the generated artifacts + the new plugin registration.

## Verification

```sh
cd apis/corsair
npm run typecheck
npm test
```

This validates the generator output and the validation helpers used by the sidecar.

## Notes

- The sidecar should remain internal to the deployment network.
- Brand names such as Corsair should not be exposed directly in end-user-facing selector text.
- The Workspace API must not assume Corsair is always present at runtime.
- The trusted contract is the generated metadata artifacts, not a live runtime dependency on the sidecar.
