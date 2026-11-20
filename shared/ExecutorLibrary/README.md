# ExecutorLibrary

Cross-platform .NET 8 flow execution engine for the Aventisia Avintra.

## Overview

`ExecutorLibrary` parses and executes automation flows. It contains the `FlowProcessor`, which walks a flow graph, evaluates conditional branches, handles loops, and dispatches node execution to the appropriate node processors.

## Key Components

- **FlowProcessor** — Core engine that processes the full flow graph
- **Models** — Flow, node, edge, and execution-status models
- **Helpers** — Utilities for graph traversal, condition evaluation, and logging

## Usage

`ExecutorLibrary` is referenced by the workspace backend to run flows server-side and can also be used by other .NET executors.

```sh
cd shared/ExecutorLibrary
dotnet build
```

## Relationship to Other Projects

- Uses `shared/NodeLibrary` for node definitions and strategies.
- Complements `clients/RunnerApp` (cross-platform runner) and the `apis/WorcBackend` services.
- For a detailed execution spec, see `apis/WorcBackend-legacy/WorkspaceAPIs/Features/ExecuteFlow/README.md`.

## Notes

- Target framework: .NET 8.
- Keep flow-processing logic independent of transport concerns (SignalR, HTTP, etc.).

## Node logs

`FlowProcessor` emits one log per executed node; consumers (`RunnerApp`, the server executor)
persist them, and the Studio canvas reconstructs a run from them. Log order is meaningful —
they are stamped and returned by `ExecutedAt`.

- The flow's `flowEndNode` is never logged: it is a visual terminator, so a completed run
  leaves the End step unmarked and the last executed node remains the visible end.
- A Block or Call Agent caller log is written when its sub-flow starts and flipped when it
  returns. It is unsuccessful when the sub-flow fails, and carries the failing node's `Status`;
  on cancellation it reads `Sub-flow execution aborted.` A nested caller's status is prefixed
  once.
- An aborted flow appends one marker log for the node that was in flight:
  `IsSuccess = false`, `Outputs["Status"] = "Execution aborted."`. A node that already logged
  its failure (a sub-flow caller whose log was flipped) keeps that one row.
- Every log carries `LoopReferenceId`, `LoopIterationIndex` and `CallerReferenceId`, inherited
  from the enclosing loop and the invoking Block/Call Agent, so a step inside a sub-flow can
  be attributed to the iteration and caller that ran it.
