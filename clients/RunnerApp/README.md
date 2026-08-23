# RunnerApp

.NET 8 console-based executor that runs automation flows autonomously. Replaces the legacy .NET Framework WPF `NodeExecutor`.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              Desktop app (Tauri + React)                                 │
│  ┌────────────────────────┐    ┌──────────────────────────┐    ┌─────────────────────┐ │
│  │ Studio React UI        │    │ Tauri in-process WS bus  │    │ launch_runner_app   │ │
│  │ - execute button       │◄──►│ 127.0.0.1:0 broadcast/echo│───►│ - spawns RunnerApp   │ │
│  │ - abort button         │    │ - node progress           │    │ - passes jobId/token│ │
│  │ - per-node live status │    │ - abort control           │    │ - passes WS port    │ │
│  └────────────────────────┘    └──────────────────────────┘    └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
┌──────────────────────────────┐      ┌──────────────────────┐      ┌─────────────────┐
│     WorkspaceAPIs (.NET 8)    │◄────►│   RunnerApp (.NET 8)  │      │  Office / UI    │
│  - execution graph endpoint    │      │  - fetches graph      │◄────►│  automation     │
│  - job start/close             │      │  - runs flow          │      │  (Excel, etc.)  │
│  - node execution logs         │      │  - pushes WS progress │      │                 │
│  - SignalR command routing*    │      │  - closes job         │      │                 │
└──────────────────────────────┘      └──────────────────────┘      └─────────────────┘
```

\* SignalR / server-mode command routing is present in the codebase but is **not used by the
local desktop flow**. For local desktop runs, the Tauri app launches RunnerApp in local mode
(`--jobId`, `--accessToken`, `--websocketPort`) and all control/progress messages travel over
the in-process Tauri WebSocket. Server mode remains available but is **not validated** — do not
use it in production without testing.

The executor supports backend `OrchestratorHub` (SignalR) commands (`Initiate`, `Abort`, `Pause`,
`Resume`, `Killed`) in **server/service mode**. If SignalR is unavailable in that mode, it falls back to HTTP
polling with a 30-second timeout. The local desktop sidecar path does not use SignalR or HTTP polling; it
receives abort control and sends progress over the in-process Tauri WebSocket.

## Prerequisites

- .NET SDK 8.0
- Windows (for COM interop — Excel, Word, UI automation)
- Access to a WorkspaceAPIs backend instance

## Build

```sh
dotnet build clients/RunnerApp/RunnerApp.csproj
```

## Publish

`publish.sh` produces a versioned, **self-contained** single-file Windows binary (the .NET 8 runtime is embedded, so the target machine does not need it installed) and packages it into `artifacts/AvintraRunnerApp_<version>_win-x64.zip`. It also copies `Install-AvintraRunnerService.ps1` into `artifacts/` so the provisioning script can be uploaded to the server's `scripts/` directory alongside the runner zip.

```sh
./clients/RunnerApp/publish.sh
# or with an explicit version
./clients/RunnerApp/publish.sh --version 0.1.83
```

The CI/CD pipeline uploads the zip to `/var/www/aventisia.com/files/binaries/` and the scripts to `/var/www/aventisia.com/files/scripts/` on each target server.

## Run (Local Desktop Mode)

For local development and desktop-app flows, launch RunnerApp from the Tauri desktop app
or manually with the local WebSocket port:

```sh
dotnet run --project clients/RunnerApp/RunnerApp.csproj -- \
  --appBaseUrl https://your-backend \
  --accessToken <jwt-token> \
  --jobId <job-guid> \
  --websocketPort <tauri-ws-port>
```

### Arguments

| Argument          | Required | Description                                               |
| ----------------- | -------- | --------------------------------------------------------- |
| `--appBaseUrl`    | Yes      | Backend API base URL (e.g. `https://avdev.aventisia.com`) |
| `--accessToken`   | Yes      | JWT access token for authentication                       |
| `--jobId`         | Yes      | Job ID to execute                                         |
| `--websocketPort` | No       | Local Tauri WebSocket port for progress + abort control   |

`osId`, `username`, and `hostname` are detected at runtime from the local machine and are no
longer accepted as CLI arguments.

## Run as Windows Service

> **WARNING — UNVALIDATED.** Windows-service / SignalR mode is implemented but has **not been
> tested or validated** in this sprint. Only the local desktop (console) mode is verified. Do not
> run service mode in production without a dedicated validation pass.

### Prerequisites

The Windows Service build is **self-contained** and bundles the .NET 8 runtime, so the target machine does not need .NET 8 installed.

### Automated PowerShell install (recommended)

Use the provisioning script to install everything in one step. The script downloads the runner (which bundles the .NET 8 runtime) and registers it as a Windows service.

The script resolves the **latest** runner version automatically from the backend, so you don't need to supply a zip URL. Run it from an elevated PowerShell prompt:

```powershell
.\Install-AvintraRunnerService.ps1 `
  -AppBaseUrl "https://api.avintra.com" `
  -ApiKey "<API_KEY>" `
  -TenantId "<TENANT_ID>" `
  -LinkedUsername "<LINKED_USERNAME>"
```

You can also pipe the script directly from the web (Ollama-style). Set the environment variables first, then run:

```powershell
$env:AVINTRA_APP_BASE_URL = "https://api.avintra.com"
$env:AVINTRA_API_KEY = "<API_KEY>"
$env:AVINTRA_TENANT_ID = "<TENANT_ID>"
$env:AVINTRA_LINKED_USERNAME = "<LINKED_USERNAME>"
irm https://<host>/files/scripts/Install-AvintraRunnerService.ps1 | iex
```

The script must be run from an elevated PowerShell prompt. It installs the runner to `C:\Program Files\AvintraRunnerService` and starts the service automatically.

The runner is self-contained, so no .NET 8 runtime or winget install is required on the target machine.

> **Unvalidated:** the automated install path is provided as-is and has not been exercised in
> this sprint.

Available parameters:

| Parameter        | Default                                 | Description                                                                                                        |
| ---------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `RunnerZipUrl`   | — (resolved automatically)              | URL of the runner zip archive to download. Optional; when omitted the latest version is resolved from the backend. |
| `AppBaseUrl`     | —                                       | Backend API base URL.                                                                                              |
| `ApiKey`         | —                                       | Tenant API key.                                                                                                    |
| `TenantId`       | —                                       | Tenant ID (GUID).                                                                                                  |
| `LinkedUsername` | —                                       | Linked workspace username.                                                                                         |
| `InstallDir`     | `C:\Program Files\AvintraRunnerService` | Directory to extract the runner to.                                                                                |
| `ServiceName`    | `AvintraRunnerService`                  | Name of the Windows service.                                                                                       |
| `DoNotStart`     | `$false`                                | Install the service but do not start it.                                                                           |

### Manual install

You can install the runner as a Windows service interactively:

```powershell
AvintraRunnerService.exe --install
```

The installer will prompt for:

- `appBaseUrl` — Backend API base URL
- `apiKey` — Tenant API key
- `tenantId` — Tenant ID
- `linkedUsername` — Linked workspace username

Or perform a silent install by passing all required values on the command line:

```powershell
AvintraRunnerService.exe --install --appBaseUrl https://api.avintra.com --apiKey <key> --tenantId <guid> --linkedUsername <user>
```

This registers a service named **"AvintraRunnerService"** that starts automatically on boot. The install command must be run from an elevated (Administrator) command prompt; it will request UAC elevation automatically if needed.

The backend connection parameters are embedded into the service `binPath`, so the service can start unattended. `osId`, `username`, and `hostname` are detected at runtime from the local machine.

> **Note:** `--install` does not validate the backend URL or credentials. It only registers the service. The runner is self-contained, so no .NET 8 runtime check is performed.

### Uninstall

```powershell
AvintraRunnerService.exe --uninstall
```

### Start / Stop (after install)

```sh
sc start "AvintraRunnerService"
sc stop "AvintraRunnerService"
```

### Run with service flag (for manual testing)

```powershell
AvintraRunnerService.exe --service \
  --appBaseUrl https://your-backend \
  --apiKey <key> \
  --tenantId <guid> \
  --linkedUsername <user>
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
clients/RunnerApp/
├── RunnerApp.csproj          # Project file
├── RunnerAppOptions.cs       # CLI argument model
├── RunnerAppService.cs       # BackgroundService for Windows service mode
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

## Usage

**Local desktop mode (validated):**

```powershell
AvintraRunnerApp.exe --appBaseUrl <url> --accessToken <token> --jobId <guid> [--websocketPort <port>]
```

**Service mode (UNVALIDATED — see warning above):**

```powershell
AvintraRunnerService.exe --install
AvintraRunnerService.exe --uninstall
AvintraRunnerService.exe --run --service --appBaseUrl <url> --apiKey <key> --tenantId <id> --linkedUsername <user> [options]
```

## Related

- `apis/WorcBackend-legacy/WorkspaceAPIs/Features/ExecuteFlow/` — Backend execution APIs
- `apis/WorcBackend-legacy/WorkspaceAPIs/Hubs/OrchestratorHub.cs` — SignalR hub for machine communication
