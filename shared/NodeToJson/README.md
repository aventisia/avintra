# NodeToJson

Utility to convert automation node definitions to JSON for the Aventisia WORC Platform.

## Overview

`NodeToJson` is a console application that reads node definitions from `shared/NodeLibrary` and emits JSON representations. This JSON is used by the frontend flow builder and other tools that need a runtime description of available nodes.

## Getting Started

```sh
cd shared/NodeToJson
dotnet run
```

## Project Structure

- **Models** — Output JSON models
- **Helpers** — Conversion and serialization helpers
- **Program.cs** — Entry point

## Notes

- Target framework: .NET 8.
- Depends on `shared/NodeLibrary` for the source node definitions.
- Output location and format are controlled by the utility's configuration.
