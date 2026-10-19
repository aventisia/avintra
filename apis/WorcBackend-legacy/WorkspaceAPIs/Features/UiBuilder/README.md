# UI Builder

Lets a user turn a plain-language prompt into a custom web page and keep every attempt.

## What it stores

- A **project** is the named entry the user creates from the workspace UI Builder table
  (a name plus an optional description). Projects are scoped to a tenant and a space,
  and can be made visible tenant-wide.
- A **version** is one full HTML document produced by a prompt. Versions are append-only:
  each new generation adds a row with the next version number for its project, and the
  newest version is the one the builder shows.
- **Dual-format storage.** A version also records its output format: `html` (a single
  standalone document) or `framework` (React JSX). A `framework` version keeps the JSX
  **source** in a separate column, while the built standalone document is stored in the
  same HTML field every version uses. That field is always the page that gets rendered, so
  viewers do not need to know which format a version came from.

## Rules that are easy to get wrong

- **Insert guards.** An empty format is stored as `html`; an unknown format is rejected, and
  a `framework` version without a non-empty source is rejected. An `html` version always
  stores a null source.
- **Restore copies the format too.** Restoring a version copies its document, format, and
  source, so a restored version renders and behaves exactly like the original.
- **The new columns are additive and rollback safe.** Dropping them leaves `GeneratedHtml`
  renderable, because a framework version already stores a full standalone page there.
- **Restore never rewrites history.** Restoring an older version creates a *new* version
  that copies that document and becomes the current head.
- **Version numbers are per project.** The next number is calculated inside one database
  transaction so two near-simultaneous prompts do not collide.
- **Deleting a project deletes its versions** (cascade).
- **Attribution.** Every generation records `ref_type = "UiBuilder"`,
  `action = "UiBuilderGeneration"`, and `ref_id = <projectId>` for credit reporting.

## Boundaries (v1)

- There is no archive and no server-side HTML sanitizer. The generated page is only ever rendered
  inside a sandboxed iframe.
- **Publishing pins the current version.** The owner can publish a project once it has at least
  one version; publishing again pins the newer version. **Disable** hides a published project
  instead of un-publishing it.
- **Assigned users see the pinned version.** A published project is shared with individual users,
  or with all tenant members, and those users see the pinned version read-only in Assist under
  **User Interfaces**. Saving a new version changes nothing for them until the owner publishes
  again.
- **Disable hides and blocks.** Disabling removes the project from Published and blocks assigned
  access, while keeping the assignments; enabling restores both without re-assigning.
- **Assigned-view access is separate from tenant-wide builder sharing**, and viewing a published
  interface is free.

## Models

- `GET ui-builder/models` lists the tenant's enabled **Text** models (a missing capability counts as
  Text) from enabled provider rows, de-duplicated by provider and model, for any signed-in builder.
  It returns the provider name, model id, provider URL, and the vault credential's name and env
  (`dev`/`prod`), never a secret. The credential is resolved by id across env and space.

## Data connections

- A project stores up to 10 **data connections** in a JSON column. Each binds a key (letters, digits,
  `_`, starting with a letter, unique per project ignoring case) to one queue with allowed operations
  (`list`, `get`, `add`, `update`), a fetch mode (`auto`/`manual`), and the queue's env (`dev`/`prod`).
- Only the owner replaces the list (`PUT ui-builder/{id}/data-connections`). Each queue must exist in
  the tenant, be enabled, and belong to the binding's env; the queue name is refreshed on save.
  Project insert and update never change the list. Connections are project-level, not per version.
- **Runtime proxy** (`ui-builder/{id}/data/{key}/...`) lets a sandboxed interface read and write its
  queue. Opening the project is the capability: the owner, tenant-wide builders, or, when published
  and enabled, assigned or tenant-wide viewers (the same rule as the published view). No queue
  permission is needed; the operation must be allowed on the binding. Calls reuse the queue work
  item services, so schema validation, unique keys, encryption, and status rules still apply.
- **Env must match.** Queue lookups use the request's `X-Env-Type`; a request whose env differs from
  the binding's env is rejected, so the caller sends `X-Env-Type: <binding envType>`.
- Updating an item replaces the whole payload when `workItemData` is sent and keeps the item's
  description. The list has no total count; page with `top` (1..200, default 50) and `skip`.

## Data queries

`POST ui-builder/{id}/data/{key}/query` runs a declarative query over the bound queue for dashboards
and analytics (`UiBuilderDataQueryRequestDto`): shared `filters` plus up to 10 named `queries`, each an
aggregate (`groupBy` with optional date `bucket`, `metrics` with optional per-metric `where`) or a
filtered, sorted row set. Fields are schema field names or `$status`, `$createdOn`, `$lastModifiedOn`,
`$assignee`; unknown fields, operators, or functions return 400 with the available fields. Access is the
same as `list` (the binding must allow `list`). The engine is `UiBuilderDataQueryHelpers` (pure, in
memory): it scans at most `MaxScannedItems` (100,000) newest non-disabled items, decrypts encrypted
queues, and reports `truncated` when the cap is hit. Date-only upper bounds include the whole day.

Every result set also returns a plain-language `description` and a `formulas` map (metric name →
formula text using the schema field labels and all filters that apply), and the response carries a
`filterDescription` of the shared filters, so hosts and pages can explain each figure. Extra spec
properties used only for display (`title`, metric `label`, `derived`) are ignored by the engine.
