# NodeLibrary

Cross-platform .NET 8 library containing automation node definitions for the Aventisia WORC Platform.

## Overview

`NodeLibrary` defines the building blocks of an automation flow: node types, attributes, converters, models, enumerations, helpers, and the core execution strategies. It is consumed by `shared/ExecutorLibrary`, `shared/NodeToJson`, and the desktop executor.

## Key Components

- **Nodes** — Node type definitions and implementations
- **Attributes** — Metadata and serialization attributes for nodes
- **Converters** — JSON and model converters
- **Core** — Core abstractions and base classes
- **Enums** — Shared enumerations
- **Models** — Node data models
- **Helpers** — Utility classes for node handling

## Usage

```sh
cd shared/NodeLibrary
dotnet build
```

## Relationship to Other Projects

- Consumed by `shared/ExecutorLibrary` to execute node logic.
- Consumed by `shared/NodeToJson` to convert node definitions to JSON.
- Consumed by `clients/NodeExecutor` (legacy executor).

## Notes

- Target framework: .NET 8.
- New node types should be added here and exported for use by the flow engine.
