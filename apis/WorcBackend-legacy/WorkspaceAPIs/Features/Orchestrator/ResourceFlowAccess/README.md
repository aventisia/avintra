# Resource Flow Access

This feature stores which flows may use a given resource. It is the flow-side sibling of the
people-sharing table (`ResourceShare`): one row links a resource to one flow, one flow can have
many linked resources, and one resource can have many linked flows. The list is tenant-scoped
only; it does not carry a space.

## What the list is

- A single table, `ws_ResourceFlowAccess`, keyed by tenant, resource type, resource id,
  and flow id, with a unique index over all four.
- The resource id is a loose id (no foreign key) because the resource is polymorphic; only
  the flow side carries a foreign key to `Flows`.
- Access is granted per flow, so every version of that flow inherits the grant.
- Rows are tenant-scoped only. They do not carry a space; the resource side keeps its own
  space scoping. New assignment picks are scoped to the current space (Central sees only
  spaceless flows); already-assigned cross-space rows stay valid so a re-save never forces
  their removal.

## Restricted flag

- Restricted or open is stored on the resource (`Tool.IsResourceAccessRestricted`,
  `Queue.IsResourceAccessRestricted`, `VaultCredential.IsResourceAccessRestricted`, and
  `KnowledgeBase.IsResourceAccessRestricted`), not inferred from the rows. A restricted
  resource is usable only by the flows listed; a restricted resource with no rows is
  usable by no flow.
- Saving a non-empty list restricts the resource. Saving an empty list is the only way to
  open it again, so removing rows by other paths (archive, flow delete) never lifts a
  restriction.
- Existing gates still apply. An open resource does not bypass a resource's tenant-wide flag
  or its people-sharing rows.
- Adding a flow requires the caller to own or be a member of it. Flows already on the list
  can be kept or removed by any editor of the resource.
- Assignment candidates are scoped to the current space (Central sees only spaceless flows),
  but the grant itself carries no space: the resource and the flow already carry their own
  `SpaceId`, so already-assigned cross-space flows keep working and stay re-saveable.
- Publish checks only the restriction on the resource in the current environment. The Prod
  clone's flag and rows are copied add-only but are not enforced anywhere until runtime
  enforcement lands.
- When a save restricts the resource, the response lists, in `unassignedPublishedFlows`, the
  published flows whose publish would resolve the resource's name to this resource but that
  are not on the list.

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
  name in the current space (Central sees only spaceless flows) across the flows the caller created or is a member of; an empty query returns the 10
  most recently created flows. Its sole caller is the assignment dialog, so the space rule
  lives here intentionally. An optional `types` query array narrows the result to the
  given `FlowTypesEnum` values instead of the non-block default. Flows whose every version
  is archived are excluded. Results carry the same version count and modification time as
  the assigned list.
- `FlowBuilderService.PublishFlowVersionAsync` enforces the check at publish time: it blocks
  with a 403 when the publishing flow is not listed on a restricted referenced tool, queue or
  vault credential. Definition resolution is the enforcement point; execution-time pickup is
  not covered yet.
- `GET queue/by-agent/{flowVersionId}` stays for the studio. It resolves the version to its
  flow space-free and answers from the queue rows, then lists queues in the current space,
  so it returns the same space-scoped queues the assignment list holds. An unknown version is a 404.
- PROD parity lives in `FlowBuilderService.EnsureProdToolsAsync`,
  `EnsureProdQueuesAsync` and `EnsureProdVaultCredentialsAsync`, which copy a Dev resource's
  flow set onto its Production clone. Vault credentials are matched by name and space. The
  sync is add-only: it adds missing rows and sets the restricted flag when Dev has it, but
  never removes rows or lifts a restriction set directly on Prod by an OM. PROD edits stay
  blocked by the OM-only guard.
- Flow rows are removed when the resource is deleted (`ToolService`, `QueueTableService`,
  `VaultCredentialService`), when archive deletes an orphaned Prod resource
  (`AgentTableService`), when archiving every non-archived version of a flow
  (`AgentTableService` and `AssistChatService`; a failure fails the archive), when a tenant
  is deleted (`ManageTenantService`), and by database cascade when the flow is deleted.
  Archiving a version while a sibling stays active keeps the rows, because sibling versions
  share them. Unarchiving does not restore removed rows. Removing rows never opens a
  restricted resource.

## Queues

- Queues used the older `QueueFlowVersion` table, one row per queue and flow version with an
  `AccessType`. That table is gone (`DropQueueFlowVersion`).
- The migration kept one row per queue and flow when any version of the flow was linked.
  This widens access on purpose: a flow linked through one version is now usable by every
  version of that flow. `AccessType` was not carried over and is not enforced anywhere;
  rolling the table back restores its shape only, never the per-version rows.
- Emptying a queue's list is the way to make it open again, exactly as for tools.

## Current rollout

- The Tool, Queue, VaultCredential, KnowledgeBase, and Skill resource types are wired. Other
  configure types keep their existing behavior and will adopt the same list later.

## Known gaps

- Runtime resolution (`ToolService.GetToolByNameAsync`, queue work pickup, llmpipeline) does
  not check flow access yet; enforcement happens only at publish time.
- The restriction on a Prod clone is inert: nothing reads it, so it neither blocks nor allows
  a flow until runtime enforcement lands.
