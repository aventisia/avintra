# NodeLibrary

Cross-platform .NET 8 library containing automation node definitions for the Aventisia Avintra.

## Overview

The library has been split into two projects:

- **`NodeLibrary.Core`** — portable node definitions (attributes, converters, core abstractions, enums, models, helpers, and platform-agnostic nodes). This is the project most consumers should reference.
- **`NodeLibrary.Windows`** — Windows-specific nodes and helpers (UI Automation, Windows credential management, etc.). Only referenced by Windows runners and tooling.

## Key Components

### NodeLibrary.Core

- **Attributes** — Metadata and serialization attributes for nodes
- **Converters** — JSON and model converters
- **Core** — Core abstractions and base classes
- **Enums** — Shared enumerations
- **Models** — Node data models
- **Helpers** — Utility classes for node handling
- **Nodes** — Platform-agnostic node definitions

### NodeLibrary.Windows

- Windows Desktop interop nodes
- UI Automation helpers
- Windows-specific node categories

## Usage

```sh
# Build only the portable core
cd shared/NodeLibrary/NodeLibrary.Core
dotnet build

# Build the Windows-specific extensions
cd ../NodeLibrary.Windows
dotnet build
```

## Relationship to Other Projects

- Consumed by `shared/ExecutorLibrary` to execute node logic.
- Consumed by `shared/NodeToJson` to convert node definitions to JSON.
- Consumed by `clients/RunnerApp` runners (Core is portable; Windows references the Windows-specific project).
- Consumed by `apis/WorcBackend-legacy/WorkspaceAPIs` for shared enums and core models.

## Notes

- Target framework: .NET 8.
- New platform-agnostic node types should be added to `NodeLibrary.Core`.
- Windows-only nodes belong in `NodeLibrary.Windows`.
