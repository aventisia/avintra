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

## Output

The utility writes the generated JSON into the Studio web app's source tree only:

- Per-node config files → `clients/web-apps/apps/studio/src/features/dynamic-config-panel/constants/config-json/<Node>.json`
- Action selector mapping → `clients/web-apps/apps/studio/src/features/action-selector/constants/_ActionSelectorData.json` (merged with the existing file to preserve legacy categories)

No desktop-app or local AppData copies are emitted. Cloud connector config files are **not** copied by this tool — they are served to the Studio web app from the WorkspaceAPIs backend at runtime.

## Notes

- Target framework: .NET 8.
- Depends on `shared/NodeLibrary` for the source node definitions.
- Output location is hardcoded relative to the build output directory.
