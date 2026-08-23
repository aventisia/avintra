using Microsoft.Extensions.DependencyInjection;
using RunnerApp;

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

// Make the app base URL available to nodes that still rely on AppConfigHelper.ResolveAppBaseUrl().
// This is a compatibility bridge; new/updated nodes should read CallerContext.Get(context).AppBaseUrl.
Environment.SetEnvironmentVariable("APP_BASE_URL", options.AppBaseUrl);

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
            services.AddSingleton(NotificationServiceFactory.Create());
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
    var engine = new DesktopExecutionEngine(options.AccessToken, options.AppBaseUrl);
    var notifications = NotificationServiceFactory.Create();

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
                case LocalControlCommand.Resume:
                    // Local desktop mode intentionally does not support pause/resume in the
                    // POC: the Tauri WebSocket is a simple broadcast bus and pause coordination
                    // across the Studio UI + runner process is not yet hardened. Only Abort is
                    // honored; Pause/Resume are logged and ignored.
                    DebugLog.Info($"Received {command} via local WebSocket. Ignoring in local mode.");
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
                "Windows", MachineIdentity.OsId, MachineIdentity.Username, MachineIdentity.Hostname,
                options.TenantId, options.ApiKey, options.LinkedUsername);
        }
        else
        {
            registration = await backendClient.RegisterMachineAsync(
                "Windows", MachineIdentity.OsId, MachineIdentity.Username, MachineIdentity.Hostname);
        }

        var accessToken = registration?.Jwt ?? options.AccessToken;
        if (registration != null)
            Console.WriteLine($"Registered as machine {registration.MachineId}.");
        else
            Console.WriteLine("Warning: Machine registration failed. Continuing with the provided token.");

        // Use the machine JWT (if any) for subsequent backend + hub calls.
        backendClient = new BackendHttpClient(httpClient, accessToken);
        engine = new DesktopExecutionEngine(accessToken, options.AppBaseUrl);

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

    var parsedFlow = ReactFlowHelper.Parse(graph.ReactFlowObject)
        ?? throw new InvalidOperationException("Failed to parse execution graph ReactFlow object.");

    Console.WriteLine("Marking job as running...");
    try
    {
        await backendClient.StartJobAsync(targetJobId);
        notifications.NotifyJobStarted(targetJobId, graph.FlowName);
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
                var node = parsedFlow.Nodes.FirstOrDefault(n => n.Id == nodeId);
                if (node?.Data?.IsDisabled == true)
                {
                    DebugLog.Info($"Node progress (running) skipped because node is disabled: {nodeId}");
                    return;
                }

                DebugLog.Info($"Node progress (running): {nodeId}");
                _ = localWs.PushNodeProgressAsync(nodeId, "running", nodeId, null);
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
                _ = localWs.PushNodeProgressAsync(nodeLog.NodeId, status, nodeLog.NodeName, nodeLog);
            }

            // Always log failed node details to the console/debug log so a local run
            // can be diagnosed even when the backend close request fails or the WebSocket
            // is not connected.
            if (!nodeLog.IsSuccess)
            {
                var inputs = nodeLog.Inputs is not null && nodeLog.Inputs.Count > 0
                    ? string.Join(", ", nodeLog.Inputs.Select(kvp => $"{kvp.Key}={kvp.Value}"))
                    : "none";
                var status = nodeLog.Outputs is not null && nodeLog.Outputs.TryGetValue("Status", out var s)
                    ? s
                    : "no status";
                DebugLog.Warn($"Node '{nodeLog.NodeName}' ({nodeLog.NodeId}) failed after {nodeLog.Duration:F0}ms. Inputs: {inputs}. Status: {status}");
            }
        },
        // Local mode: push exactly which edge was traversed so Studio can highlight the
        // path taken and avoid coloring unrelated edges.
        (edgeId, targetNodeId) =>
        {
            if (localWs is not null)
            {
                DebugLog.Info($"Edge traversed: {edgeId} -> {targetNodeId}");
                _ = localWs.PushEdgeTraversedAsync(edgeId, targetNodeId);
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
            await localWs.PushNodeProgressAsync(log.NodeId, status, log.NodeName, log);
        }
    }

    // Local mode: tell the Studio app the whole job has reached a terminal state so it can
    // reset the execute button (stop -> play) without waiting on a backend SignalR event,
    // which local runs do not emit.
    if (localWs is not null)
    {
        DebugLog.Info($"Job completed ({jobStatus})");
        await localWs.PushJobCompletedAsync(jobStatus, result.ErrorMessage, result.NodeLogs?.ToList());
    }

    Console.WriteLine($"Closing job with status: {jobStatus}");
    try
    {
        var closeRemarks = result.Status switch
        {
            FlowExecutionStatus.Failed => BackendHttpClient.BuildFailedNodeRemark(result.NodeLogs.ToList(), result.ErrorMessage),
            FlowExecutionStatus.Aborted => "Job aborted by runner.",
            _ => null,
        };

        await backendClient.CloseJobAsync(targetJobId, result.Status, result.NodeLogs.ToList(), closeRemarks);
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Failed to close job: {ex.Message}");
    }

    progressTimer?.Stop();
    progressTimer?.Dispose();

    if (hubClient is not null)
        await hubClient.ReportCompletionAsync(targetJobId, jobStatus, result.ErrorMessage);

    notifications.NotifyJobFinished(targetJobId, graph.FlowName, jobStatus, result.ErrorMessage);
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
            var createExitCode = RunSc("create", serviceName, "binPath=", binPath, "start=auto");
            if (createExitCode != 0)
            {
                Console.Error.WriteLine($"sc create failed with exit code {createExitCode}.");
                return 1;
            }
            Console.WriteLine($"Service '{serviceName}' installed successfully.");
        }
        else
        {
            RunSc("stop", serviceName);
            var deleteExitCode = RunSc("delete", serviceName);
            if (deleteExitCode != 0)
            {
                Console.Error.WriteLine($"sc delete failed with exit code {deleteExitCode}.");
                return 1;
            }
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

static int RunSc(params string[] arguments)
{
    var psi = new System.Diagnostics.ProcessStartInfo
    {
        FileName = "sc",
        UseShellExecute = false,
        RedirectStandardOutput = true,
        RedirectStandardError = true,
        CreateNoWindow = true,
    };
    foreach (var arg in arguments)
    {
        psi.ArgumentList.Add(arg);
    }

    using var process = System.Diagnostics.Process.Start(psi);
    if (process is null)
    {
        Console.Error.WriteLine("Failed to start sc.exe.");
        return -1;
    }

    var stdout = process.StandardOutput.ReadToEnd();
    var stderr = process.StandardError.ReadToEnd();
    process.WaitForExit();

    if (!string.IsNullOrWhiteSpace(stdout))
        Console.WriteLine(stdout.Trim());
    if (!string.IsNullOrWhiteSpace(stderr))
        Console.Error.WriteLine(stderr.Trim());

    return process.ExitCode;
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
    // Wrap values in quotes so spaces are preserved when the service binPath is parsed.
    // Escape any embedded double-quotes so the outer quoting remains valid.
    var escaped = value.Replace("\"", "\\\"");
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
    // Local dev defaults are intentionally null — pass credentials via CLI args
    // (--appBaseUrl, --accessToken, --jobId) or environment variables:
    //   RUNNER_APP_BASE_URL, RUNNER_ACCESS_TOKEN
    // Never hardcode JWTs or tenant secrets in source.
    string? appBaseUrl = Environment.GetEnvironmentVariable("RUNNER_APP_BASE_URL");
    string? accessToken = Environment.GetEnvironmentVariable("RUNNER_ACCESS_TOKEN");
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

    // Service mode requires a tenant API key, tenant ID, and linked username. If the user
    // explicitly passed --service we must enforce those values; otherwise we fall back to
    // console mode which needs an access token.
    var isExplicitService = args.Contains("--service", StringComparer.OrdinalIgnoreCase);
    var hasApiKey = !string.IsNullOrWhiteSpace(apiKey);
    var hasTenantId = !string.IsNullOrWhiteSpace(tenantId);
    var hasLinkedUsername = !string.IsNullOrWhiteSpace(linkedUsername);
    var isServiceMode = hasApiKey && hasTenantId && hasLinkedUsername;

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
    Console.Error.WriteLine("  AvintraRunnerApp --appBaseUrl <url> --accessToken <token> --jobId <guid> [--websocketPort <port>]");
    Console.Error.WriteLine("                                          Run once in local desktop mode");
    Console.Error.WriteLine("");
    Console.Error.WriteLine("Local (recommended) options:");
    Console.Error.WriteLine("  --appBaseUrl <url>       Backend API base URL (required)");
    Console.Error.WriteLine("  --accessToken <token>    JWT access token (required)");
    Console.Error.WriteLine("  --jobId <guid>           Job ID to execute (required)");
    Console.Error.WriteLine("  --websocketPort <port>   Local Tauri WebSocket port (node progress + abort control)");
    Console.Error.WriteLine("");
    Console.Error.WriteLine("SERVICE MODE (UNVALIDATED - do not use in production without testing):");
    Console.Error.WriteLine("  AvintraRunnerApp --install [--appBaseUrl <url> --apiKey <key> --tenantId <id> --linkedUsername <user>]");
    Console.Error.WriteLine("                                Install as Windows service (interactive or silent)");
    Console.Error.WriteLine("  AvintraRunnerApp --uninstall  Uninstall Windows service");
    Console.Error.WriteLine("  AvintraRunnerApp --run --service --appBaseUrl <url> --apiKey <key> --tenantId <id> --linkedUsername <user>");
    Console.Error.WriteLine("                                Run as long-lived Windows service");
}

enum ExecutorMode
{
    Run,
    Install,
    Uninstall
}
