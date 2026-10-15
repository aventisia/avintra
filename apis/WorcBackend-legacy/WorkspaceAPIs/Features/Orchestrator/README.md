# Orchestrator

Dispatches agent jobs to machines and reports their progress. Three paths can hand a job to a
machine: the time-trigger scheduler, the runner's REST poll, and the machine's hub connection.
All three follow the same two rules.

## Claim before send

A job is only dispatched after it has been claimed in the database. The claim is one conditional
update: it matches the job id, `Status=Created`, and a machine id that is empty or already the
claiming machine. The claim wins only when the update reports exactly one affected row.

Because the database serializes that update, exactly one dispatcher can win a job. A loser must
not send anything: it skips the job. This replaces the older read-then-write assignment, where
two dispatchers could both read the same unassigned job and both send it.

## Recovery of unassigned jobs

Time-trigger jobs are created without a machine. If the scheduler cannot push them, they stay
`Created` and unassigned. The poll and hub-connect paths pick those jobs up and claim them, so a
job is never stuck when a machine was offline at trigger time.

Only the current `Time` trigger value is matched. Older text values written by previous versions
are not recoverable and are handled separately.

## Delivery result

A dispatch is `delivered` as soon as the command has been handed to the machine's connection.
Notifications sent afterwards (chained pull, tenant broadcasts) are best effort: if one of them
fails, the job stays delivered and is not released, because the machine already has the command.

When a dispatch is not delivered, the job is released back to unassigned, and the machine's
pending-job marker is cleared only if it still points at that job. The marker is not cleared when
another dispatch has already replaced it.

## Single pod assumption

Machine presence and pending-job markers live in memory in this API process. The database claim
guarantees one winner across the dispatch paths, and the poll additionally holds a transaction
scoped advisory lock per machine. Running more than one WorkspaceAPIs pod would need those
markers to move to shared storage.
