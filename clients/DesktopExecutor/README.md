# DesktopExecutor

.NET 8 console-based executor that runs automation flows autonomously. Replaces the legacy .NET Framework WPF `NodeExecutor`.

## Architecture

```
┌─────────────────┐      ┌──────────────────────────────┐      ┌──────────────────────┐
│   React UI      │      │     WorkspaceAPIs (.NET 8)    │      │   DesktopExecutor    │
│ (viewer / ctrl) │◄────►│  - job state machine          │◄────►│  (.NET 8 console)    │
│                 │      │  - execution graph endpoint    │      │                      │
│                 │      │  - log ingestion endpoint      │      │  - fetches graph     │
│                 │      │  - SignalR command routing     │      │  - runs flow         │
│                 │      │  - real-time notifications     │      │  - holds COM state   │
└─────────────────┘      └──────────────────────────────┘      │  - reports logs      │
                                                                 └──────────────────────┘
```

The executor connects to the backend's `OrchestratorHub` (SignalR) to receive commands (`Initiate`, `Abort`, `Pause`, `Resume`, `Killed`). If SignalR is unavailable, it falls back to HTTP polling with a 30-second timeout.

## Prerequisites

- .NET SDK 8.0
- Windows (for COM interop — Excel, Word, UI automation)
- Access to a WorkspaceAPIs backend instance

## Build

```sh
dotnet build clients/DesktopExecutor/DesktopExecutor.csproj
```

## Run (Console Mode)

```sh
dotnet run --project clients/DesktopExecutor/DesktopExecutor.csproj -- \
  --appBaseUrl https://your-backend \
  --accessToken <jwt-token> \
  --jobId <job-guid> \
  [--osId <machine-id>] \
  [--username <user>] \
  [--appVersion <version>]
```

### Arguments

| Argument        | Required | Description                                                |
| --------------- | -------- | ---------------------------------------------------------- |
| `--appBaseUrl`  | Yes      | Backend API base URL (e.g. `https://avdev.aventisia.com`)  |
| `--accessToken` | Yes      | JWT access token for authentication                        |
| `--jobId`       | Yes      | Job ID to execute                                          |
| `--osId`        | No       | Machine OS identifier (default: `Environment.MachineName`) |
| `--username`    | No       | Machine username (default: `Environment.UserName`)         |
| `--appVersion`  | No       | App version (default: `1.0.0`)                             |

## Run as Windows Service

### Install

```sh
dotnet run --project clients/DesktopExecutor/DesktopExecutor.csproj -- --install
```

This registers a service named **"Avintra Desktop Executor"** that starts automatically on boot.

### Uninstall

```sh
dotnet run --project clients/DesktopExecutor/DesktopExecutor.csproj -- --uninstall
```

### Start / Stop (after install)

```sh
sc start "Avintra Desktop Executor"
sc stop "Avintra Desktop Executor"
```

### Run with service flag (for manual testing)

```sh
dotnet run --project clients/DesktopExecutor/DesktopExecutor.csproj -- \
  --service \
  --appBaseUrl https://your-backend \
  --accessToken <jwt-token> \
  --jobId <job-guid>
```

## How It Works

1. **Connect** — Connects to `OrchestratorHub` via SignalR as an `AvintraMachine` (identified by `osId` + `username`).
2. **Wait for command** — Listens for `Initiate` command from the hub. Falls back to HTTP polling after 30s if no command arrives.
3. **Fetch graph** — Calls `GET /execution/graph/{jobId}` to retrieve the full execution graph (including sub-flows).
4. **Start job** — Calls `POST /job/start` to mark the job as `Running`.
5. **Execute flow** — Runs the flow using `FlowProcessor` + `NodeProcessor` from `shared/ExecutorLibrary` and `shared/NodeLibrary`.
6. **Handle commands** — During execution, listens for:
   - `Abort` / `Killed` — cancels execution via `CancellationToken`
   - `Pause` — blocks execution via `ManualResetEvent`
   - `Resume` — unblocks execution
7. **Close job** — Calls `POST /job/close` with the final status (`Completed`, `Aborted`, or `Failed`).
8. **Report** — Sends completion notification via SignalR `ReportCompletionAsync`.

## Project Structure

```
clients/DesktopExecutor/
├── DesktopExecutor.csproj          # Project file
├── DesktopExecutorOptions.cs       # CLI argument model
├── DesktopExecutorService.cs       # BackgroundService for Windows service mode
├── ExecutionGraphDto.cs            # DTO matching backend response
├── Program.cs                      # Entry point (console + service modes)
└── Services/
    ├── BackendFlowGraphProvider.cs # IFlowGraphProvider using cached graph
    ├── BackendHttpClient.cs        # REST client for backend APIs
    ├── DesktopExecutionEngine.cs   # Wraps FlowProcessor + NodeProcessor
    ├── IBackendClient.cs           # Backend client interface
    ├── IExecutionEngine.cs         # Execution engine interface
    ├── IOrchestratorHubClient.cs   # SignalR hub client interface + enums
    └── OrchestratorHubClient.cs    # SignalR hub client implementation
```

## Dependencies

- `shared/ExecutorLibrary/` — Flow processor, graph traversal, condition evaluation, loop support
- `shared/NodeLibrary/` — Node implementations (Excel, Word, UI automation, LLM, variables, etc.)

## Platform Support

- **Windows** — Full support including COM interop (Excel, Word) and UI automation (FlaUI)
- **Linux / Mac** — Cross-platform nodes only; Windows-only nodes are skipped at runtime

## Related

- `DESKTOP_EXECUTOR_PLAN.md` — Full migration plan and phase breakdown
- `apis/WorcBackend-legacy/WorkspaceAPIs/Features/ExecuteFlow/` — Backend execution APIs
- `apis/WorcBackend-legacy/WorkspaceAPIs/Hubs/OrchestratorHub.cs` — SignalR hub for machine communication

## Usage

```bash
DesktopExecutor --install
DesktopExecutor --uninstall
DesktopExecutor --run --appBaseUrl <url> --accessToken <token> --jobId <guid> [options]
DesktopExecutor --run --service --appBaseUrl <url> --accessToken <token> --jobId <guid> [options]
```
