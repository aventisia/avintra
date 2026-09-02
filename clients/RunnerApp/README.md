# RunnerApp

.NET 8 console-based executor that runs automation flows autonomously. Replaces the legacy .NET Framework WPF `NodeExecutor`.

## Architecture

RunnerApp operates in three distinct modes:

1. **Local desktop mode** — launched directly by the Tauri desktop app for single-shot, under-development flows.
2. **Windows service mode** — a long-lived SignalR listener that receives job assignments and spawns short-lived worker processes to execute them.
3. **Worker mode** — a short-lived per-job executor process launched by the service (or another launcher).

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
                                          │ local WebSocket (single job)
                                          ▼
┌──────────────────────────────┐      ┌──────────────────────┐      ┌─────────────────┐
│     WorkspaceAPIs (.NET 8)    │◄────►│   RunnerApp (.NET 8)  │◄────►│  Office / UI    │
│  - execution graph endpoint    │      │  - fetches graph      │      │  automation     │
│  - job start/close             │      │  - runs flow          │      │  (Excel, etc.)  │
│  - node execution logs         │      │  - pushes WS progress │      │                 │
│  - SignalR command routing*    │      │  - closes job         │      │                 │
└──────────────────────────────┘      └──────────────────────┘      └─────────────────┘

Windows service (hybrid model)
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  Service process (session 0)                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐    │
│  │ Register machine     │───►│ OrchestratorHub      │◄───│ Abort / Initiate     │    │
│  │ Listen for commands  │    │ SignalR connection    │    │ commands from backend │    │
│  └──────────────────────┘    └──────────────────────┘    └──────────────────────┘    │
│           │                                                                              │
│           │ on Initiate: spawn worker per job                                             │
│           ▼                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────┐    │
│  │ Worker process (active interactive user session by default)                    │    │
│  │  - receives machine JWT via AVINTRA_MACHINE_JWT environment variable            │    │
│  │  - fetches graph, executes flow, reports progress/completion, exits             │    │
│  │  - can display MessageBox / Office dialogs because it runs in an interactive     │    │
│  │    user session                                                                │    │
│  └─────────────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

\* SignalR / server-mode command routing is used only by the **Windows service** flow. For local desktop runs, the Tauri app launches RunnerApp in local mode (`--jobId`, `--accessToken`, `--websocketPort`) and all control/progress messages travel over the in-process Tauri WebSocket.

The service is a **hybrid** listener + worker-spawner: the service itself stays in session 0 and keeps a stable SignalR identity, while each job runs in a separate `RunnerApp.exe --worker` process. By default the worker is launched into the active interactive user session so UI-dependent nodes (MessageBox, Office dialogs, etc.) can display. With `--unattended` the worker stays in session 0 and suppresses UI.

## Prerequisites

- .NET SDK 8.0
- Windows (for COM interop — Excel, Word, UI automation)
- Access to a WorkspaceAPIs backend instance

## Build

The runner is split into a portable core library plus platform-specific executables:

- `RunnerApp.Core` — portable class library with shared logic
- `RunnerApp.Windows` — Windows executable (targets `net8.0-windows`; must build on Windows)
- `RunnerApp.Linux` — Linux shell executable (framework-dependent)
- `RunnerApp.macOS` — macOS shell executable (framework-dependent)

```sh
# Build the whole runner solution (framework-dependent for Linux/macOS, self-contained win-x64; Windows build must run on Windows)
dotnet build clients/RunnerApp/RunnerApp.slnx

# Build just the Windows executable (must run on Windows)
dotnet build clients/RunnerApp/RunnerApp.Windows/RunnerApp.Windows.csproj -r win-x64

# Build the Linux executable (can run on Linux/WSL)
dotnet build clients/RunnerApp/RunnerApp.Linux/RunnerApp.Linux.csproj -r linux-x64
```

## Publish

The runner is published per platform. Jenkins (Ubuntu agent) only builds the **Linux** runner. Windows and macOS runners must be published from the appropriate developer machine because no Jenkins agents exist for those platforms.

### Linux (Jenkins + local dev)

`publish-ci.sh` and `publish-and-upload-linux.sh` both build `RunnerApp.Linux.csproj` as a framework-dependent single-file executable for `linux-x64` and produce `artifacts/AvintraRunnerApp_<version>_linux-x64.zip`.

`publish-ci.sh` is the version used by Jenkins and can be run standalone:

```sh
./clients/RunnerApp/RunnerApp.Linux/publish-ci.sh
# or with an explicit version
./clients/RunnerApp/RunnerApp.Linux/publish-ci.sh --version 0.1.83
```

`publish-and-upload-linux.sh` additionally uploads to the selected server(s):

```sh
./clients/RunnerApp/RunnerApp.Linux/publish-and-upload-linux.sh
# non-interactive usage
./clients/RunnerApp/RunnerApp.Linux/publish-and-upload-linux.sh --target-servers uat
./clients/RunnerApp/RunnerApp.Linux/publish-and-upload-linux.sh --target-servers prod
# preview only
./clients/RunnerApp/RunnerApp.Linux/publish-and-upload-linux.sh --target-servers uat --dry-run
```

Target server options (`--target-servers` or interactive prompt):

1. `uat` → `avuat.aventisia.com`
2. `prod` → `avweb1.aventisia.com` + `avweb2.aventisia.com`

### macOS (developer machine)

`publish-and-upload-macos.sh` builds `RunnerApp.macOS.csproj` for `osx-x64` and uploads `artifacts/AvintraRunnerApp_<version>_osx-x64.zip`.

```sh
./clients/RunnerApp/RunnerApp.macOS/publish-and-upload-macos.sh --target-servers prod
./clients/RunnerApp/RunnerApp.macOS/publish-and-upload-macos.sh --target-servers 1       # uat
```

### Windows (developer machine)

`publish-and-upload-windows.ps1` builds `RunnerApp.Windows.csproj` as a **self-contained** `win-x64` executable (the .NET 8 runtime is embedded), renames it to `AvintraRunnerService.exe`, and uploads `artifacts/AvintraRunnerService_<version>_win-x64.zip` plus `Install-AvintraRunnerService.ps1` to the selected server(s).

```powershell
.\clients\RunnerApp\RunnerApp.Windows\publish-and-upload-windows.ps1 -TargetServers uat
.\clients\RunnerApp\RunnerApp.Windows\publish-and-upload-windows.ps1 -TargetServers 1   # uat
# preview only
.\clients\RunnerApp\RunnerApp.Windows\publish-and-upload-windows.ps1 -TargetServers uat -WhatIf
```

### Jenkins (CI)

Jenkins runs on an Ubuntu agent and can no longer build the Windows runner
because `RunnerApp.Windows` targets `net8.0-windows`. The `Runner App` stage now
calls `publish-ci.sh` to produce the **Linux** runner and uploads
`AvintraRunnerApp_*.zip` to the server(s) mapped from the branch
(`uat` → avuat, `main` → avweb1 + avweb2).

All upload scripts place platform-specific zips in `/var/www/aventisia.com/files/binaries/`. Windows uploads also place `Install-AvintraRunnerService.ps1` in `/var/www/aventisia.com/files/scripts/`. Linux/macOS zips are framework-dependent, so the target machine must have the matching .NET 8 runtime installed.

## Run (Local Desktop Mode)

For local development and desktop-app flows, launch RunnerApp from the Tauri desktop app
or manually with the local WebSocket port:

```sh
dotnet run --project clients/RunnerApp/RunnerApp.Windows/RunnerApp.Windows.csproj -- \
  --appBaseUrl https://your-backend \
  --accessToken <jwt-token> \
  --jobId <job-guid> \
  --websocketPort <tauri-ws-port>
```

### Arguments

| Argument          | Required | Description                                               |
| ----------------- | -------- | --------------------------------------------------------- |
| `--appBaseUrl`    | Yes      | Backend API base URL (e.g. `https://avuat.aventisia.com`) |
| `--accessToken`   | Yes      | JWT access token for authentication                       |
| `--jobId`         | Yes      | Job ID to execute                                         |
| `--websocketPort` | No       | Local Tauri WebSocket port for progress + abort control   |

`osId`, `username`, and `hostname` are detected at runtime from the local machine and are no
longer accepted as CLI arguments.

## Run as Windows Service (hybrid model)

The Windows service is a long-lived SignalR listener. It registers the machine with the backend,
connects to `OrchestratorHub`, and waits for `Initiate` commands. When a job arrives it spawns a
short-lived `RunnerApp.exe --worker` process to execute the job, then reports completion.

By default, the worker process is launched into the **active interactive user session** so UI-dependent
nodes (MessageBox, Office dialogs, etc.) work. Use the `-Unattended` switch (or `--unattended` CLI flag)
to keep the worker in the service's non-interactive session 0 and suppress UI.

> **Note:** The interactive-session launch path is validated by build only; full runtime validation
> across user sessions is recommended before production use.

### Prerequisites

The Windows Service build is **self-contained** and bundles the .NET 8 runtime, so the target machine does not need .NET 8 installed.

### Automated PowerShell install (recommended)

Use the provisioning script to install everything in one step. The script downloads the runner (which bundles the .NET 8 runtime) and registers it as a Windows service.

The script resolves the **latest** runner version automatically from the backend, so you don't need to supply a zip URL. Run it from an elevated PowerShell prompt:

```powershell
.\clients\RunnerApp\RunnerApp.Windows\Install-AvintraRunnerService.ps1 `
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
| `Unattended`     | `$false`                                | Pass `--unattended` to the service; spawned workers stay in session 0 and suppress UI.                             |

### Reinstall from local build

There is no dedicated reinstall script anymore. To test a locally built Windows service build:

1. Publish to a folder (e.g. `Published` next to the csproj):
   ```powershell
   dotnet publish RunnerApp.Windows.csproj -c Release -r win-x64 --self-contained --property:PublishDir=Published
   ```
2. Uninstall any existing service, then install from the new build (both steps use the exe's built-in installer and self-elevate):

   ```powershell
   .\Published\RunnerApp.exe --uninstall
   .\Published\RunnerApp.exe --install -AppBaseUrl https://your-backend -ApiKey <key> -TenantId <guid> -LinkedUsername <user>
   ```

   Add `--unattended` to install in unattended mode.

> **Important:** The service must be stopped before publishing to the same `PublishDir` because the running service locks its DLLs.

### Install from a local archive (fast offline iteration)

Use `Install-AvintraRunnerService-Local.ps1` when you have a slow internet connection or want to test a freshly-published local Windows service build without downloading anything. It behaves exactly like `Install-AvintraRunnerService.ps1`, but it uses a local zip archive instead of resolving one from the backend.

If you don't pass `-RunnerZipPath`, the script automatically picks the most recent `AvintraRunnerService_*_win-x64.zip` from `..\artifacts`.

```powershell
cd clients\RunnerApp\RunnerApp.Windows

# 1) Build the local archive (no upload)
.\publish-and-upload-windows.ps1 -TargetServers uat -SkipUpload

# 2) Install directly from the built archive
$env:AVINTRA_APP_BASE_URL = "https://uat-avintra.aventisia.com"
$env:AVINTRA_API_KEY      = "..."
$env:AVINTRA_TENANT_ID    = "..."
$env:AVINTRA_LINKED_USERNAME = "gaurav@aventisia.com"
.\Install-AvintraRunnerService-Local.ps1
```

You can also point it at a specific zip:

```powershell
.\Install-AvintraRunnerService-Local.ps1 -RunnerZipPath "..\artifacts\AvintraRunnerService_0.2.23_win-x64.zip"
```

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

Append `--unattended` to run spawned workers in session 0 without UI.

### Service command routing

The service supports backend `OrchestratorHub` (SignalR) commands:

- `Initiate` — spawns a worker process for the given job
- `Abort` / `Killed` — cancels the running worker via its `CancellationToken`
- `Pause` / `Resume` — not yet wired in the hybrid worker model

The service keeps its own SignalR connection while the worker has its own short-lived connection to report progress/completion. The backend machine identity is stable because the service registers the machine; the worker is only an executor.

### Worker mode

A worker is launched by the service (or any launcher) with the `--worker` flag:

```powershell
AvintraRunnerService.exe --worker --launcher service --appBaseUrl <url> --accessToken <jwt> --jobId <guid>
```

In practice you do not run this by hand; the service builds the command line and passes the machine JWT through the `AVINTRA_MACHINE_JWT` environment variable. The worker:

1. Reads `AVINTRA_MACHINE_JWT` and creates a backend client.
2. Fetches the execution graph for `jobId`.
3. Marks the job running (`POST /job/start`).
4. Executes the flow in-process.
5. Reports progress and completion over SignalR.
6. Exits with code `0` for success, non-zero for failure/aborted.

If `AVINTRA_UNATTENDED=true` is set, UI-dependent nodes such as `DisplayMessageNode` detect the non-interactive environment and fail fast instead of blocking.

## How It Works

### Local desktop mode

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

### Windows service (hybrid) mode

1. **Register machine** — On start, calls the backend to register this machine and obtains a machine JWT.
2. **Connect** — Connects to `OrchestratorHub` as the registered machine.
3. **Wait for command** — Listens for `Initiate` with an `ExecutionCommandDto` containing `jobId`.
4. **Start job** — Marks the job running via `POST /job/start`.
5. **Spawn worker** — Uses `WorkerProcessManager` + `WorkerProcessLauncher` to start `RunnerApp.exe --worker`.
   - Default: launches the worker in the active interactive user session (`WTSGetActiveConsoleSessionId` + `CreateProcessAsUser`) so UI nodes work.
   - `--unattended`: launches the worker in the service's own session 0 with `CreateNoWindow`.
6. **Monitor** — Waits for the worker to exit, translating exit code to `Completed`, `Aborted`, or `Failed`.
7. **Close job** — Calls `POST /job/close` with the worker's final status.
8. **Report** — Sends completion notification via the service's SignalR connection.
9. **Abort handling** — If `Abort` or `Killed` arrives while a worker is running, the service kills the worker process and reports `Aborted`.

## Project Structure

````
clients/RunnerApp/
├── RunnerApp.Core/                 # Portable class library (shared runner logic)
│   ├── RunnerApp.Core.csproj
│   ├── RunnerAppOptions.cs         # CLI argument model and mode flags
│   ├── RunnerAppService.cs         # Long-lived service SignalR listener + worker spawner
│   ├── ExecutionGraphDto.cs
│   ├── BackendFlowGraphProvider.cs
│   ├── BackendHttpClient.cs        # REST client for backend APIs
│   ├── DesktopExecutionEngine.cs   # Wraps FlowProcessor + NodeProcessor
│   ├── IBackendClient.cs
│   ├── IExecutionEngine.cs
│   ├── IOrchestratorHubClient.cs
│   ├── OrchestratorHubClient.cs    # SignalR hub client implementation
│   ├── WorkerProcessLauncher.cs    # Launch worker in active session or session 0
│   └── WorkerProcessManager.cs     # Track, kill, and wait for a spawned worker
├── RunnerApp.Windows/              # Windows executable
│   ├── RunnerApp.Windows.csproj
│   ├── Program.cs                  # Entry point: console, service, worker routing
│   ├── GlobalUsings.cs
│   ├── Install-AvintraRunnerService.ps1 # Provisioning script (name served at /files/scripts/)
│   ├── publish-and-upload-windows.ps1   # Windows publish + upload
│   └── publish-local.ps1                # Local Windows staging for desktop app dev
├── RunnerApp.Linux/                # Linux shell executable (compile-ready stub)
│   ├── RunnerApp.Linux.csproj
│   ├── publish-ci.sh               # CI publish (Linux framework-dependent binary)
│   ├── publish-and-upload-linux.sh # Linux publish + upload
│   ├── publish-local.sh            # Local Linux/WSL staging for desktop app dev
│   └── (shares Program.cs/GlobalUsings.cs from RunnerApp.Windows)
├── RunnerApp.macOS/                # macOS shell executable (compile-ready stub)
│   ├── RunnerApp.macOS.csproj
│   ├── publish-and-upload-macos.sh # macOS publish + upload
│   └── (shares Program.cs/GlobalUsings.cs from RunnerApp.Windows)
├── artifacts/                      # Publish output (gitignored, shared by all platforms)
├── RunnerApp.slnx                  # Solution file
└── README.md

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
````

**Windows service (hybrid model):**

```powershell
AvintraRunnerService.exe --install
AvintraRunnerService.exe --uninstall
AvintraRunnerService.exe --service --appBaseUrl <url> --apiKey <key> --tenantId <id> --linkedUsername <user> [options]
```

Add `--unattended` to keep spawned workers in the service's session 0 and suppress UI.

**Worker mode (normally launched by the service):**

```powershell
AvintraRunnerService.exe --worker --launcher <launcher> --appBaseUrl <url> --accessToken <jwt> --jobId <guid> [--unattended]
```

## Related

- `apis/WorcBackend-legacy/WorkspaceAPIs/Features/ExecuteFlow/` — Backend execution APIs
- `apis/WorcBackend-legacy/WorkspaceAPIs/Hubs/OrchestratorHub.cs` — SignalR hub for machine communication
- `shared/NodeLibrary/Nodes/UiInterfaceAutomations/MessageBox/MessageBoxInteractionHelpers.cs` — Unattended / interactive prompt guard
