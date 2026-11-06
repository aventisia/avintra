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
