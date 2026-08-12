using RunnerApp;
using RunnerApp.Services;
using ExecutorLibrary.FlowProcessor.Models;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var mode = ParseMode(args);
if (mode == ExecutorMode.Install)
{
    return RunServiceInstaller(args, install: true);
}
if (mode == ExecutorMode.Uninstall)
{
    return RunServiceInstaller(args, install: false);
}

// --run (default) mode: run as console app or Windows service
var options = ParseRunArguments(args);
if (options is null)
{
    PrintUsage();
    return 1;
}

if (args.Contains("--service", StringComparer.OrdinalIgnoreCase) || options.IsServiceMode)
{
    // Run as Windows service using Generic Host
    var host = Host.CreateDefaultBuilder(args)
        .UseWindowsService(optionsBuilder =>
        {
            optionsBuilder.ServiceName = "AvintraRunnerService";
        })
        .ConfigureServices((_, services) =>
        {
            services.AddSingleton(options);
            services.AddHostedService<RunnerAppService>();
        })
        .ConfigureLogging(logging =>
        {
            logging.AddConsole();
            logging.AddEventLog();
        })
        .Build();

    await host.RunAsync();
    return 0;
}

// Console mode: run directly
return await RunConsoleAsync(options);

static async Task<int> RunConsoleAsync(RunnerAppOptions options)
{
    var isLocal = !options.IsServiceMode;
    var targetJobId = options.JobId!.Value;

    // Backend REST client + execution engine are shared by both modes.
    using var httpClient = new HttpClient { BaseAddress = new Uri(options.AppBaseUrl) };
    var backendClient = new BackendHttpClient(httpClient, options.AccessToken);
    var engine = new DesktopExecutionEngine(options.AccessToken);

    var cts = new CancellationTokenSource();
    var abortRequested = false;
    var pauseResume = new ManualResetEventSlim(true);

    // Local mode: no machine registration, no server SignalR. Progress + control flow over
    // the Tauri local WebSocket (single-shot, unpublished, under-development flows).
    await using var hubClient = isLocal ? null : new OrchestratorHubClient(
        options.AppBaseUrl,
        options.AccessToken,
        LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<OrchestratorHubClient>());

    await using var localWs = isLocal
        ? new LocalWebSocketClient(options.WebsocketPort, targetJobId)
        : null;

    if (isLocal)
    {
        DebugLog.Info($"Running in LOCAL mode for job {targetJobId} " +
                      $"with websocket port {options.WebsocketPort}.");

        localWs!.CommandReceived += (_, command) =>
        {
            switch (command)
            {
                case LocalControlCommand.Abort:
                    DebugLog.Info("Received Abort via local WebSocket.");
                    abortRequested = true;
                    pauseResume.Set();
                    cts.Cancel();
                    break;
                case LocalControlCommand.Pause:
                    DebugLog.Info("Received Pause via local WebSocket.");
                    pauseResume.Reset();
                    break;
                case LocalControlCommand.Resume:
                    DebugLog.Info("Received Resume via local WebSocket.");
                    pauseResume.Set();
                    break;
            }
        };

        localWs.Disconnected += (_, reason) =>
            DebugLog.Warn($"Local WebSocket disconnected: {reason}");

        await localWs.ConnectAsync();
    }
    else
    {
        // Register the machine with the backend and obtain its machine JWT.
        DebugLog.Info("Running in SERVER mode.");

        MachineRegistrationResult? registration;
        if (options.IsServiceMode)
        {
            registration = await backendClient.RegisterMachineWithApiKeyAsync(
                "Windows", options.OsId, options.Username, MachineIdentity.Hostname,
                options.TenantId, options.ApiKey, options.LinkedUsername);
        }
        else
        {
            registration = await backendClient.RegisterMachineAsync(
                "Windows", options.OsId, options.Username, MachineIdentity.Hostname);
        }

        var accessToken = registration?.Jwt ?? options.AccessToken;
        if (registration != null)
            Console.WriteLine($"Registered as machine {registration.MachineId}.");
        else
            Console.WriteLine("Warning: Machine registration failed. Continuing with the provided token.");

        // Use the machine JWT (if any) for subsequent backend + hub calls.
        backendClient = new BackendHttpClient(httpClient, accessToken);
        engine = new DesktopExecutionEngine(accessToken);

        var commandReceived = new TaskCompletionSource<ExecutorCommandReceivedEventArgs?>();

        hubClient!.CommandReceived += (_, e) =>
        {
            if (e.Command == ExecutorCommand.Initiate)
            {
                commandReceived.TrySetResult(e);
            }
            else if (e.Command == ExecutorCommand.Abort || e.Command == ExecutorCommand.Killed)
            {
                abortRequested = true;
                pauseResume.Set();
                commandReceived.TrySetResult(null);
                cts.Cancel();
            }
            else if (e.Command == ExecutorCommand.Pause)
            {
                pauseResume.Reset();
            }
            else if (e.Command == ExecutorCommand.Resume)
            {
                pauseResume.Set();
            }
        };

        hubClient.Disconnected += (_, reason) =>
        {
            Console.WriteLine($"SignalR disconnected: {reason}.");
            commandReceived.TrySetResult(null);
        };

        Console.WriteLine("Connecting to OrchestratorHub...");
        try
        {
            await hubClient.ConnectAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Failed to connect to OrchestratorHub: {ex.Message}.");
            commandReceived.TrySetResult(null);
        }

        if (!options.JobId.HasValue)
        {
            Console.WriteLine("Waiting for Initiate command...");
            var initiateTimeout = Task.Delay(TimeSpan.FromSeconds(30), cts.Token);
            var completed = await Task.WhenAny(commandReceived.Task, initiateTimeout);

            if (completed == initiateTimeout)
            {
                Console.WriteLine("No Initiate command received via SignalR within timeout.");
                return 1;
            }
        }

        var command = commandReceived.Task.IsCompletedSuccessfully ? commandReceived.Task.Result : null;
        targetJobId = command?.JobId ?? options.JobId!.Value;
    }

    Console.WriteLine($"Fetching execution graph for job {targetJobId}...");
    var graph = await backendClient.GetExecutionGraphAsync(targetJobId);
    if (graph is null)
    {
        Console.Error.WriteLine("Execution graph not found.");
        return 1;
    }

    Console.WriteLine("Marking job as running...");
    try
    {
        await backendClient.StartJobAsync(targetJobId);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Failed to mark job as running: {ex.Message}");
    }

    FlowExecutionResult result;
    var lastReportedNode = string.Empty;

    // Local mode: push every node transition over the local WS immediately so the Studio
    // app can render live node indicators. Server mode: keep the periodic backend progress
    // timer so the OrchestratorHub receives updates.
    System.Timers.Timer? progressTimer = null;
    if (!isLocal)
    {
        progressTimer = new System.Timers.Timer(TimeSpan.FromSeconds(15).TotalMilliseconds) { AutoReset = true };
        progressTimer.Elapsed += (_, _) =>
        {
            if (!string.IsNullOrEmpty(lastReportedNode))
            {
                Console.WriteLine($"Progress: executing node {lastReportedNode}");
                _ = hubClient!.ReportProgressAsync(targetJobId, $"Executing node {lastReportedNode}");
            }
        };
        progressTimer.Start();
    }

    try
    {
        Console.WriteLine("Executing flow...");
        result = await engine.ExecuteAsync(graph, cts.Token, nodeId =>
        {
            lastReportedNode = nodeId;

            // Local mode: push progress over the WS (running) as each node starts.
            if (localWs is not null)
            {
                DebugLog.Info($"Node progress (running): {nodeId}");
                _ = localWs.PushNodeProgressAsync(nodeId, "running", nodeId);
            }
        },
        // Local mode: push the per-node outcome over the WS immediately as each node
        // completes, so the Studio app flips the node from spinner to success/failed
        // right away instead of waiting for the whole flow to finish.
        nodeLog =>
        {
            if (localWs is not null)
            {
                var status = nodeLog.IsSuccess ? "success" : "failed";
                DebugLog.Info($"Node progress ({status}): {nodeLog.NodeId}");
                _ = localWs.PushNodeProgressAsync(nodeLog.NodeId, status, nodeLog.NodeName);
            }
        });
    }
    catch (OperationCanceledException)
    {
        Console.WriteLine("Execution was cancelled.");
        result = new FlowExecutionResult
        {
            IsSuccess = false,
            Status = FlowExecutionStatus.Aborted,
            StartTime = DateTimeOffset.UtcNow,
            EndTime = DateTimeOffset.UtcNow,
            ErrorMessage = abortRequested ? "Execution aborted by user." : "Execution cancelled.",
            NodeLogs = []
        };
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"Execution failed: {ex.Message}");
        result = new FlowExecutionResult
        {
            IsSuccess = false,
            Status = FlowExecutionStatus.Failed,
            StartTime = DateTimeOffset.UtcNow,
            EndTime = DateTimeOffset.UtcNow,
            ErrorMessage = ex.Message,
            NodeLogs = []
        };
    }

    var jobStatus = result.Status switch
    {
        FlowExecutionStatus.Completed => "Completed",
        FlowExecutionStatus.Aborted => "Aborted",
        _ => "Failed"
    };

    // Local mode: push the final per-node outcome over the local WS so the Studio app can
    // flip running nodes to success/failed as the run finishes.
    if (localWs is not null && result.NodeLogs is not null)
    {
        foreach (var log in result.NodeLogs)
        {
            var status = log.IsSuccess ? "success" : "failed";
            DebugLog.Info($"Node progress ({status}): {log.NodeId}");
            await localWs.PushNodeProgressAsync(log.NodeId, status, log.NodeName);
        }
    }

    // Local mode: tell the Studio app the whole job has reached a terminal state so it can
    // reset the execute button (stop -> play) without waiting on a backend SignalR event,
    // which local runs do not emit.
    if (localWs is not null)
    {
        DebugLog.Info($"Job completed ({jobStatus})");
        await localWs.PushJobCompletedAsync(jobStatus, result.ErrorMessage);
    }

    Console.WriteLine($"Closing job with status: {jobStatus}");
    try
    {
        await backendClient.CloseJobAsync(targetJobId, result.Status, result.NodeLogs.ToList());
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Failed to close job: {ex.Message}");
    }

    progressTimer?.Stop();
    progressTimer?.Dispose();

    if (hubClient is not null)
        await hubClient.ReportCompletionAsync(targetJobId, jobStatus, result.ErrorMessage);

    Console.WriteLine($"Execution finished: {result.Status}");
    return result.IsSuccess ? 0 : 1;
}

static ExecutorMode ParseMode(string[] args)
{
    for (int i = 0; i < args.Length; i++)
    {
        switch (args[i].ToLowerInvariant())
        {
            case "--install":
                return ExecutorMode.Install;
            case "--uninstall":
                return ExecutorMode.Uninstall;
        }
    }
    return ExecutorMode.Run;
}

static int RunServiceInstaller(string[] args, bool install)
{
    try
    {
        var serviceName = "AvintraRunnerService";
        var executablePath = Environment.ProcessPath
            ?? throw new InvalidOperationException("Cannot determine executable path.");

        // sc create/delete require elevation; relaunch ourselves with UAC when not running elevated.
        if (!IsElevated())
        {
            Console.WriteLine("Administrator privileges are required. Requesting elevation...");
            var psi = new System.Diagnostics.ProcessStartInfo
            {
                FileName = executablePath,
                UseShellExecute = true,
                Verb = "runas"
            };
            foreach (var arg in args)
            {
                psi.ArgumentList.Add(arg);
            }
            using var elevated = System.Diagnostics.Process.Start(psi);
            elevated?.WaitForExit();
            return elevated?.ExitCode ?? 1;
        }

        if (install)
        {
            var installOptions = TryParseInstallArguments(args)
                ?? PromptForInstallParameters();

            if (installOptions is null)
            {
                Console.Error.WriteLine("Installation cancelled: required parameters were not provided.");
                return 1;
            }

            var binPath = BuildServiceBinPath(executablePath, installOptions);
            var createProcess = System.Diagnostics.Process.Start("sc", $"create \"{serviceName}\" binPath=\"{binPath}\" start=auto");
            createProcess?.WaitForExit();
            if (createProcess?.ExitCode != 0)
            {
                Console.Error.WriteLine($"sc create failed with exit code {createProcess?.ExitCode}.");
                return 1;
            }
            Console.WriteLine($"Service '{serviceName}' installed successfully.");
        }
        else
        {
            var stopProcess = System.Diagnostics.Process.Start("sc", $"stop \"{serviceName}\"");
            stopProcess?.WaitForExit();
            var deleteProcess = System.Diagnostics.Process.Start("sc", $"delete \"{serviceName}\"");
            deleteProcess?.WaitForExit();
            Console.WriteLine($"Service '{serviceName}' uninstalled successfully.");
        }
        return 0;
    }
    catch (Exception ex)
    {
        Console.Error.WriteLine($"Failed to {(install ? "install" : "uninstall")} service: {ex.Message}");
        return 1;
    }
}

static RunnerAppOptions? TryParseInstallArguments(string[] args)
{
    string? appBaseUrl = null;
    string? apiKey = null;
    string? tenantId = null;
    string? linkedUsername = null;

    for (int i = 0; i < args.Length; i++)
    {
        switch (args[i].ToLowerInvariant())
        {
            case "--appbaseurl":
                if (++i < args.Length) appBaseUrl = args[i];
                break;
            case "--apikey":
                if (++i < args.Length) apiKey = args[i];
                break;
            case "--tenantid":
                if (++i < args.Length) tenantId = args[i];
                break;
            case "--linkedusername":
                if (++i < args.Length) linkedUsername = args[i];
                break;
        }
    }

    if (string.IsNullOrWhiteSpace(appBaseUrl) ||
        string.IsNullOrWhiteSpace(apiKey) ||
        string.IsNullOrWhiteSpace(tenantId) ||
        string.IsNullOrWhiteSpace(linkedUsername))
    {
        return null;
    }

    return new RunnerAppOptions
    {
        AppBaseUrl = appBaseUrl,
        ApiKey = apiKey,
        TenantId = tenantId,
        LinkedUsername = linkedUsername,
    };
}

static RunnerAppOptions? PromptForInstallParameters()
{
    Console.WriteLine("Install AvintraRunnerService as a Windows service.");
    Console.WriteLine("Press Ctrl+C to cancel.");
    Console.WriteLine();

    var appBaseUrl = Prompt("Backend API base URL (e.g. https://api.avintra.com): ");
    if (string.IsNullOrWhiteSpace(appBaseUrl))
    {
        Console.Error.WriteLine("Backend API base URL is required.");
        return null;
    }

    var apiKey = Prompt("Tenant API key: ");
    if (string.IsNullOrWhiteSpace(apiKey))
    {
        Console.Error.WriteLine("Tenant API key is required.");
        return null;
    }

    var tenantId = Prompt("Tenant ID (GUID): ");
    if (string.IsNullOrWhiteSpace(tenantId) || !Guid.TryParse(tenantId, out _))
    {
        Console.Error.WriteLine("A valid Tenant ID GUID is required.");
        return null;
    }

    var linkedUsername = Prompt("Linked workspace username: ");
    if (string.IsNullOrWhiteSpace(linkedUsername))
    {
        Console.Error.WriteLine("Linked workspace username is required.");
        return null;
    }

    return new RunnerAppOptions
    {
        AppBaseUrl = appBaseUrl,
        ApiKey = apiKey,
        TenantId = tenantId,
        LinkedUsername = linkedUsername,
    };
}

static string Prompt(string message)
{
    Console.Write(message);
    return Console.ReadLine()?.Trim() ?? string.Empty;
}

static string BuildServiceBinPath(string executablePath, RunnerAppOptions options)
{
    var arguments = new List<string>
    {
        "--service",
        $"--appBaseUrl {QuoteForSc(options.AppBaseUrl)}",
        $"--apiKey {QuoteForSc(options.ApiKey)}",
        $"--tenantId {QuoteForSc(options.TenantId)}",
        $"--linkedUsername {QuoteForSc(options.LinkedUsername)}",
    };

    var argsLine = string.Join(" ", arguments);
    return $"\"{executablePath}\" {argsLine}";
}

static string QuoteForSc(string value)
{
    // sc expects inner quotes to be escaped as \" so that a value like a"b becomes a\"b.
    var escaped = value.Replace("\\", "\\\\").Replace("\"", "\\\"");
    return $"\"{escaped}\"";
}

static bool IsElevated()
{
    try
    {
        using var identity = System.Security.Principal.WindowsIdentity.GetCurrent();
        var principal = new System.Security.Principal.WindowsPrincipal(identity);
        return principal.IsInRole(System.Security.Principal.WindowsBuiltInRole.Administrator);
    }
    catch
    {
        // Non-Windows platforms are always considered elevated.
        return true;
    }
}

static RunnerAppOptions? ParseRunArguments(string[] args)
{
    string? appBaseUrl = null;
    string? accessToken = null;
    Guid? jobId = null;
    string? apiKey = null;
    string? tenantId = null;
    string? linkedUsername = null;
    int websocketPort = 0;

    for (int i = 0; i < args.Length; i++)
    {
        switch (args[i].ToLowerInvariant())
        {
            case "--appbaseurl":
                if (++i < args.Length) appBaseUrl = args[i];
                break;
            case "--accesstoken":
                if (++i < args.Length) accessToken = args[i];
                break;
            case "--jobid":
                if (++i < args.Length && Guid.TryParse(args[i], out var id)) jobId = id;
                break;
            case "--apikey":
                if (++i < args.Length) apiKey = args[i];
                break;
            case "--tenantid":
                if (++i < args.Length) tenantId = args[i];
                break;
            case "--linkedusername":
                if (++i < args.Length) linkedUsername = args[i];
                break;
            case "--websocketport":
                if (++i < args.Length && int.TryParse(args[i], out var port)) websocketPort = port;
                break;
        }
    }

    if (string.IsNullOrWhiteSpace(appBaseUrl))
        return null;

    // Service mode requires a tenant API key and tenant ID. If the user explicitly passed --service
    // we must enforce those values; otherwise we fall back to console mode which needs an access token.
    var isExplicitService = args.Contains("--service", StringComparer.OrdinalIgnoreCase);
    var hasApiKey = !string.IsNullOrWhiteSpace(apiKey);
    var hasTenantId = !string.IsNullOrWhiteSpace(tenantId);
    var isServiceMode = hasApiKey && hasTenantId;

    if (isExplicitService && !isServiceMode)
        return null;

    if (!isServiceMode && (string.IsNullOrWhiteSpace(accessToken) || jobId is null))
        return null;

    return new RunnerAppOptions
    {
        AppBaseUrl = appBaseUrl,
        AccessToken = accessToken ?? string.Empty,
        JobId = jobId,
        ApiKey = apiKey ?? string.Empty,
        TenantId = tenantId ?? string.Empty,
        LinkedUsername = linkedUsername ?? string.Empty,
        WebsocketPort = websocketPort,
    };
}

static void PrintUsage()
{
    Console.Error.WriteLine("Usage:");
    Console.Error.WriteLine("  AvintraRunnerService --install                              Install as Windows service (interactive)");
    Console.Error.WriteLine("  AvintraRunnerService --install --appBaseUrl <url> --apiKey <key> --tenantId <id> --linkedUsername <user>");
    Console.Error.WriteLine("                                                         Install as Windows service (silent)");
    Console.Error.WriteLine("  AvintraRunnerService --uninstall                            Uninstall Windows service");
    Console.Error.WriteLine("  AvintraRunnerService --run --appBaseUrl <url> [options]     Run once (console)");
    Console.Error.WriteLine("  AvintraRunnerService --run --service [options]              Run as Windows service");
    Console.Error.WriteLine("");
    Console.Error.WriteLine("Install options (for silent install):");
    Console.Error.WriteLine("  --appBaseUrl <url>       Backend API base URL (required)");
    Console.Error.WriteLine("  --apiKey <key>           Tenant API key (required)");
    Console.Error.WriteLine("  --tenantId <guid>        Tenant ID (required)");
    Console.Error.WriteLine("  --linkedUsername <name>  Linked workspace username (required)");
    Console.Error.WriteLine("");
    Console.Error.WriteLine("Run options:");
    Console.Error.WriteLine("  --appBaseUrl <url>       Backend API base URL (required)");
    Console.Error.WriteLine("  --accessToken <token>    JWT access token (console/local mode)");
    Console.Error.WriteLine("  --jobId <guid>           Job ID to execute (console/local mode; optional in service mode)");
    Console.Error.WriteLine("  --websocketPort <port>   Local Tauri WebSocket port (local/non-service mode, node progress + control)");
    Console.Error.WriteLine("  --apiKey <key>           Tenant API key (service mode, long-lived registration)");
    Console.Error.WriteLine("  --tenantId <guid>        Tenant ID (service mode)");
    Console.Error.WriteLine("  --linkedUsername <name>  Linked workspace username (service mode)");
    Console.Error.WriteLine("  --service                Run as Windows service (no console)");
}

enum ExecutorMode
{
    Run,
    Install,
    Uninstall
}
