# AgentsTable

Serves the agents list of Build > Agents and the archive actions behind its row menu. The list
reads `FlowsTable`; this feature owns the OM agent endpoints and the tenant-facing
archive/unarchive endpoints.

## Archive and unarchive

`POST agent/{flowId}/archive` and `POST agent/{flowId}/unarchive` act on an agent (a flow), not on
one version, and return the number of versions changed. They sit on the base `[Authorize]`
controller and allow an Operations Manager, or the flow's creator or anyone with Owner or Edit
access on it. The older `PUT agent` stays role-restricted to Operations Managers.

Archive fans out to every unarchived version of the flow in one transaction. It flags them all
archived and saves first, then reuses `ArchiveFlowVersionAsync` per version, so the orphan scan
sees the fan-out's siblings as archived instead of in use. The guard reads every version, so a
single unarchived published version refuses the whole call with `409` and no write; the agent is
never half-archived.

Unarchive flips every archived version of the flow back. It only restores visibility: queues,
triggers, machines and shared resources detached at archive time stay detached. Neither action
touches `IsDisabled`; the Disable flag and the archive flag are independent.

## Rules that are easy to break

- Only these endpoints and `PUT agent` (OM, one version, no published guard, kept as it was) may
  flip `IsArchived`. `PUT flow-version/update` rejects any `IsArchived` change with `409` and points
  at the Archive or Unarchive action, so it cannot bypass the guard or the fan-out.
- Archive is per flow, so a manual per-version archive through `PUT agent` is also undone by the
  flow's Unarchive.
- The list DTO carries only the latest version's `isArchived`/`isPublished`, so the client gate is
  a convenience; the server guard is the rule.
