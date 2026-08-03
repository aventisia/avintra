# NodeExecutor

Windows desktop workflow executor for the Aventisia WORC Platform.

## Overview

`NodeExecutor` is a Windows-only solution that runs automation flows on the desktop. It hosts a WPF executor, a set of Windows Workflow Foundation-style code activities, and helper tools for inspecting UI elements and converting activity definitions to JSON.

## Projects

| Project                 | Description                                        |
| ----------------------- | -------------------------------------------------- |
| `NodeExecutor`          | Main WPF application that executes flows           |
| `CodeActivitiesLibrary` | Reusable activity library (.NET Framework 4.8)     |
| `ExecutorLibrary`       | Legacy cross-platform executor library (kept here) |
| `NodeLibrary`           | Legacy node library (kept here)                    |
| `UIInspector`           | WPF tool for inspecting Windows UI elements        |
| `CodeActivityToJSON`    | Utility to serialize code activities to JSON       |

## Getting Started

Open `NodeExecutor.sln` in Visual Studio or build with MSBuild:

```sh
cd clients/NodeExecutor
# Restore and build the main solution
msbuild NodeExecutor.sln /p:Configuration=Release /p:Platform="Any CPU"
```

## NodeExecutor Post-Build

The `NodeExecutor` project has a post-build event that copies its output to:

1. `clients/desktop-app/src-tauri/binaries/node-executor` — used by the Tauri desktop app.
2. `%LOCALAPPDATA%\AvintraDesktopApp\binaries\node-executor` — local runtime location.

## Notes

- Target framework: .NET Framework 4.8 (Windows only).
- For the modern cross-platform executor engine, see `shared/ExecutorLibrary/` and `shared/NodeLibrary/`.
- For the Tauri desktop app, see `clients/desktop-app/`.
