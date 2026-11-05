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
- `apis/corsair/src/data/popular-tools.json` lists the curated popular names. A row is popular only
  when its display name matches one of those names ignoring case; a duplicated, unmatched,
  or ambiguous name is logged as a warning and the seeding continues.

## Tenant enablement

- A row in `ai_TenantPlatformTools` means the tenant has the tool switched on. There is no
  off flag: switching off deletes the row and records nothing else. Both catalog and mapping
  rows are tenant-specific; no environment or space column exists, and none is filtered on.
- Popular tools are mapped for a tenant lazily, the first time anyone in that tenant opens
  Tools, and only when that tenant has no mapping rows at all. Any existing row means the
  tenant has already chosen, so a newly popular tool is never forced on it. Tenant creation
  is untouched. A tenant that switches every tool off has no rows left, so the popular set
  is mapped again on its next visit.
- The library list is the existing `GET tools/platform` list. Each row carries the calling
  tenant's on/off state in the existing `IsActive` field and the curated mark in `IsPopular`;
  custom tools keep their stored `IsActive` meaning.
- Switching a tool on or off is per tenant and applies across its spaces and environments.
  It is gated to tenant-admins and orchestrator-managers, and the request must state
  `isEnabled` explicitly; a body without it is rejected. A catalog-disabled tool cannot
  be switched on and answers `400`.
- Switching on records who did it and when. The usable-tools lists and the flow builder show
  the tenant's custom tools plus the library tools it has switched on. A switched-off tool
  only disappears from those lists; flows already using it keep running, and publishing a
  flow that uses a switched-on library tool still passes the existing publish check.

## Deletion

Deleting a tenant through the workspace tenant-deletion path removes that tenant's mapping
rows. The catalog rows in `ai_PlatformTools` are shared and are never deleted with a tenant.

## Custom-tool names

A custom tool may not take a name that another tool already uses. The check is a
trimmed, case-insensitive exact match against the calling tenant's custom tools and
against every library catalog display name, and it runs when a tool is created and
when it is renamed. A colliding library name is reported as "already exists as a
library tool"; a colliding custom name keeps the existing message. Rejected requests
create or change nothing, and tools created before this rule keep their names.

## Usable catalog

The usable catalog lists the tenant's own custom tools plus the library tools that
tenant has switched on and that are not disabled in the catalog. Neither a
switched-off nor another tenant's library tool appears, and the response shape is
unchanged, so the flow builder and picker keep working as they do today.
