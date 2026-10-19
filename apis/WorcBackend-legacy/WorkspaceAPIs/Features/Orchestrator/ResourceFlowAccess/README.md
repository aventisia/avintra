# Resource Flow Access

This feature stores which flows may use a given resource. It is the flow-side sibling of the
people-sharing table (`ResourceShare`): one row links a resource to one flow, One flow can have many linked resources, and one resource can have many linked flows. The list is tenant-scoped only; it does not carry a space.

## What the list is

- A single table, `ws_ResourceFlowAccess`, keyed by tenant, resource type, resource id,
  and flow id, with a unique index over all four.
- The resource id is a loose id (no foreign key) because the resource is polymorphic; only
  the flow side carries a foreign key to `Flows`.
- Access is granted per flow, so every version of that flow inherits the grant.
- Rows are tenant-scoped only. They do not carry a space; the resource side keeps its own
  space scoping. Assignment is intentionally cross-space: any flow in the tenant may be
  assigned to a resource in any space.

## Restricted flag

- Restricted or open is stored on the tool (`Tool.IsResourceAccessRestricted`), not inferred from
  the rows. A restricted tool is usable only by the flows listed; a restricted tool with no
  rows is usable by no flow.
- Saving a non-empty list restricts the tool. Saving an empty list is the only way to open it
  again, so removing rows by other paths (archive, flow delete) never lifts a restriction.
- Existing gates still apply. An open tool does not bypass a resource's tenant-wide flag
  or its people-sharing rows.
- Adding a flow requires the caller to own or be a member of it. Flows already on the list
  can be kept or removed by any editor of the tool.
- Publish checks only the restriction on the tool in the current environment. The Prod clone's
  flag and rows are copied add-only but are not enforced anywhere until runtime enforcement lands.
- When a save restricts the tool, the response lists, in `unassignedPublishedFlows`, the published
  flows whose publish would resolve the tool's name to this tool but that are not on the list.

## Where the pieces live

- `ResourceFlowAccessService` provides the one reusable bulk assign/list flow and the
  batch `GetAssignedFlowIdsAsync` read used for publish enforcement.
- `ResourceFlowAccessController` exposes the bulk-only routes under `resource-flows`;
  there are no per-link create/update/delete routes. `POST resource-flows/assign` carries
  the resource type, resource id, and the complete flow set in its body;
  `GET resource-flows/{resourceType}/{resourceId}/assigned-flows` lists only the flows that
  already hold access, with each flow's type, non-archived version count, and latest
  modification time across the flow and its versions.
- `SearchByQueryController.SearchFlowAsync` (`GET search/flow`) searches non-block flows by
  name across the flows the caller created or is a member of; an empty query returns the 10
  most recently created flows. An optional `types` query array narrows the result to the
  given `FlowTypesEnum` values instead of the non-block default. Flows whose every version
  is archived are excluded. Results carry the same version count and modification time as
  the assigned list.
- `FlowBuilderService.PublishFlowVersionAsync` enforces the check at publish time: it blocks
  with a 403 when the publishing flow is not listed on a restricted referenced tool.
  Definition resolution is the enforcement point; execution-time pickup is not covered yet.
- PROD parity lives in `FlowBuilderService.EnsureProdToolsAsync`, which copies a Dev tool's
  flow set onto its Production clone. The sync is add-only: it adds missing rows and sets the
  restricted flag when Dev has it, but never removes rows or lifts a restriction set directly
  on Prod by an OM. PROD edits stay blocked by the OM-only guard.
- Flow rows are removed when the tool is deleted (`ToolService`), when archive deletes an orphaned Prod tool
  (`AgentTableService`), and when archiving every non-archived version of a flow (`AgentTableService` and
  `AssistChatService`; a failure fails the archive), and by database cascade when the flow is deleted. Archiving a version
  while a sibling stays active keeps the rows, because sibling versions share them.
  Unarchiving does not restore removed rows. Removing rows never opens a restricted tool.

## Current rollout

- Only the Tool resource type is wired in this iteration. Other configure types keep their
  existing behavior and will adopt the same list later.
- Tenant deletion does not yet remove these rows for tool resources; it is tracked as a
  follow-up because the tenant delete path bypasses the service delete methods.

## Known gaps

- Runtime resolution (`ToolService.GetToolByNameAsync`, llmpipeline) does not check flow
  access yet; enforcement happens only at publish time.
- The restriction on a Prod clone is inert: nothing reads it, so it neither blocks nor allows
  a flow until runtime enforcement lands.
