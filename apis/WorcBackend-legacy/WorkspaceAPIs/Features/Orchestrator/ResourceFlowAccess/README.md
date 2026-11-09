# Resource Flow Access

This feature stores which flows may use a given resource. It is the flow-side sibling of the
people-sharing table (`ResourceUserAccess`): one row links a resource to one flow, one flow can have
many linked resources, and one resource can have many linked flows. The list is tenant-scoped
only; it does not carry a space.

## What the list is

- A single table, `agent_ResourceFlowAccess`, keyed by tenant, resource type, resource id,
  and flow id, with a unique index over all four.
- The resource id is a loose id (no foreign key) because the resource is polymorphic; only
  the flow side carries a foreign key to `agent_Flows`.
- Access is granted per flow, so every version of that flow inherits the grant.
- Rows are tenant-scoped only. They do not carry a space; the resource side keeps its own
  space scoping. New assignment picks are scoped to the current space (Central sees only
  spaceless flows); already-assigned cross-space rows stay valid so a re-save never forces
  their removal.

## Restricted flag

- Restricted or open is stored on the resource (`Tool.IsResourceAccessRestricted`,
  `Queue.IsResourceAccessRestricted`, `ConfigStore.IsResourceAccessRestricted`,
  `VaultCredential.IsResourceAccessRestricted`, `KnowledgeBase.IsResourceAccessRestricted`,
  and `Skill.IsResourceAccessRestricted`), not inferred from the rows. A restricted
  resource is usable only by the flows listed; a restricted resource with no rows is
  usable by no flow.
- Saving a non-empty list restricts the resource. Saving an empty list is the only way to
  open it again, so removing rows by other paths (archive, flow delete) never lifts a
  restriction.
- New resources of every wired type are created restricted with no rows, so access is
  granted only by assigning agents.
- Existing gates still apply. An open resource does not bypass a resource's tenant-wide flag
  or its people-sharing rows.
- Adding a flow requires the caller to own or be a member of it. Flows already on the list
  can be kept or removed by any editor of the resource.
- Assignment candidates are scoped to the current space (Central sees only spaceless flows),
  but the grant itself carries no space: the resource and the flow already carry their own
  `SpaceId`, so already-assigned cross-space flows keep working and stay re-saveable.
- Publish checks only the restriction on the resource in the current environment. The Prod
  clone's flag and rows are copied add-only and are enforced at run time for published
  agents.
- When a save restricts the resource, the response lists, in `unassignedPublishedFlows`, the
  published flows whose publish would resolve the resource's name to this resource but that
  are not on the list.

## Where the pieces live

- `ResourceFlowAccessService` provides the one reusable bulk assign/list flow, the
  batch `GetAssignedFlowIdsAsync` read used for publish enforcement, and
  `ValidateRunResourceAccessAsync` for run-time enforcement.
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
  with a 403 when the publishing flow is not listed on a restricted referenced tool, queue,
  config store, vault credential, or knowledge base. Config store references are collected
  from `{{__config__<name>}}` placeholders in string node input values. Definition
  resolution is the enforcement point for publish; run time uses the separate validator
  described below.
- `GET queue/by-agent/{flowVersionId}` stays for the studio. It resolves the version to its
  flow space-free and answers from the queue rows, then lists queues in the current space,
  so it returns the same space-scoped queues the assignment list holds. An unknown version is a 404.
- PROD parity lives in `FlowBuilderService.EnsureProdToolsAsync`,
  `EnsureProdQueuesAsync`, `EnsureProdConfigStoresAsync`, and
  `EnsureProdVaultCredentialsAsync`, which copy a Dev resource's flow
  set onto its Production clone. Vault credentials are matched by name and space.
  The sync is add-only: it adds missing rows and sets the restricted flag when Dev has it,
  but never removes rows or lifts a restriction set directly on Prod by an OM. PROD edits
  stay blocked by the OM-only guard.
- Flow rows are removed when the resource is deleted (`ToolService`, `QueueTableService`,
  `ConfigStoreService`, `VaultCredentialService`), when archive deletes an orphaned Prod resource
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

- The Tool, Queue, ConfigStore, VaultCredential, KnowledgeBase, and Skill resource types are wired.
  Other configure types keep their existing behavior and will adopt the same list later.

## Run-time enforcement

- Every agent run validates the saved configuration before any step executes. The check
  resolves each referenced queue, tool, credential, config store, knowledge base, and skill
  in the run's environment (Dev for draft versions, Prod for published ones), including
  agents and blocks called by the flow, and refuses to start when the flow is not assigned
  to a restricted resource. The denial message names every blocking resource.
- Gates: the manual/API run (`ExecuteFlowStep1Service`) returns 403 and creates no job; a
  triggered or cloud job (`CloudJobExecutionService`) is marked `Failed` with the message;
  the desktop graph fetch (`ExecutionGraphService`) returns 403 and marks the job `Failed`;
  the chat stream (`StreamingChatService`) yields one error chunk.
- A validator failure (500) is never reported as a denial: the manual run and the graph
  fetch return 500 without touching the job, a triggered or cloud job is marked `Failed`
  with the validator message, and the chat stream yields that message.
- Names are matched case-insensitively, the same way run-time resource resolution matches
  them, so publish and run agree on which resource a reference means.
- Any-agent resources never block, and the check is read-only: it changes no assignment.
- Still not covered: publish-time collection scans only the root graph, so config store
  references held only inside subflows are not checked at publish; names generated at run
  time by node output (only saved references are scanned); and restrictions changed while a
  run is already executing.
