# Tools

The Tools feature has two stores. Custom tools belong to a person or a space and live in
`ai_Tools`. Library tools are the SaaS integration catalog every tenant starts from and live
in `ai_PlatformTools`; a tenant's choice to switch one on lives in `ai_TenantPlatformTools`
as a row per tenant and tool.

## Library catalog

- The Corsair `seed:tools` command (also run by the release pipeline) fills the catalog from
  the Corsair plugin registry: one row per SaaS integration, named after the product display
  name. The application never seeds the catalog at startup.
- The display name is the identity. Running the seeder again updates the row in place,
  keeps its id, and never overwrites an operator-set disabled flag.
- `apis/corsair/popular-tools.json` lists the curated popular names. A row is popular only
  when its display name matches one of those names ignoring case; a duplicated, unmatched,
  or ambiguous name is logged as a warning and the seeding continues.

## Tenant enablement

- A row in `ai_TenantPlatformTools` means the tenant has the tool switched on. There is no
  off flag: switching off deletes the row and records nothing else.
- Popular tools are switched on for every tenant lazily, the first time anyone in that
  tenant opens Tools. There is no seed-time backfill and tenant creation is untouched. A
  `run_ConfigStore` row named `__platform_tools_seeded` records that a tenant has been
  handled, so switching a popular tool off is not undone later. That row is internal: the
  ConfigStore read endpoints return it as not found, and the update and delete endpoints
  reject it, so tenant choices cannot be undone by removing it.
- The library list is the existing `GET tools/platform` list. Each row carries the calling
  tenant's on/off state in the existing `IsActive` field and the curated mark in `IsPopular`;
  custom tools keep their stored `IsActive` meaning.
- Switching a tool on or off is per tenant and applies across its spaces and environments.
  It is gated to tenant-admins and orchestrator-managers, and the request must state
  `isEnabled` explicitly; a body without it is rejected.
- Switching on records who did it and when. The usable-tools lists and the flow builder show
  the tenant's custom tools plus the library tools it has switched on. A switched-off tool
  only disappears from those lists; flows already using it keep running, and publishing a
  flow that uses a switched-on library tool still passes the existing publish check.

## Deletion

Deleting a tenant through the workspace tenant-deletion path removes that tenant's mapping
rows. The catalog rows in `ai_PlatformTools` are shared and are never deleted with a tenant.
