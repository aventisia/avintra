using DesktopExecutor;
using DesktopExecutor.Services;
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
            optionsBuilder.ServiceName = "AvintraDesktopRunner";
        })
        .ConfigureServices((_, services) =>
        {
            services.AddSingleton(options);
            services.AddHostedService<DesktopExecutorService>();
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

static async Task<int> RunConsoleAsync(DesktopExecutorOptions options)
{
    using var httpClient = new HttpClient { BaseAddress = new Uri(options.AppBaseUrl) };
    var registerClient = new BackendHttpClient(httpClient, options.AccessToken);

    // Register machine with backend and obtain its machine JWT
    MachineRegistrationResult? registration;
    if (options.IsServiceMode)
    {
        registration = await registerClient.RegisterMachineWithApiKeyAsync(
            "Windows", options.OsId, options.Username, Environment.MachineName,
            options.TenantId, options.ApiKey, options.LinkedUsername);
    }
    else
    {
        registration = await registerClient.RegisterMachineAsync(
            "Windows", options.OsId, options.Username, Environment.MachineName);
    }

    var accessToken = registration?.Jwt ?? options.AccessToken;
    if (registration != null)
        Console.WriteLine($"Registered as machine {registration.MachineId}.");
    else
        Console.WriteLine("Warning: Machine registration failed. Continuing with the provided token.");

    using var engineHttpClient = new HttpClient { BaseAddress = new Uri(options.AppBaseUrl) };
    var backendClient = new BackendHttpClient(engineHttpClient, accessToken);
    var engine = new DesktopExecutionEngine(accessToken);

    using var loggerFactory = LoggerFactory.Create(builder => builder.AddConsole());
    var hubLogger = loggerFactory.CreateLogger<OrchestratorHubClient>();
    await using var hubClient = new OrchestratorHubClient(
        options.AppBaseUrl,
        accessToken,
        options.OsId,
        options.Username,
        options.AppVersion,
        hubLogger);

    var cts = new CancellationTokenSource();
    var commandReceived = new TaskCompletionSource<ExecutorCommandReceivedEventArgs?>();
    var abortRequested = false;
    var pauseResume = new ManualResetEventSlim(true);

    hubClient.CommandReceived += (_, e) =>
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

    hubClient.Reconnected += (_, _) =>
    {
        Console.WriteLine("SignalR reconnected.");
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
    var targetJobId = command?.JobId ?? options.JobId!.Value;

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
    var progressTimer = new System.Timers.Timer(TimeSpan.FromSeconds(15).TotalMilliseconds) { AutoReset = true };
    progressTimer.Elapsed += (_, _) =>
    {
        if (!string.IsNullOrEmpty(lastReportedNode))
        {
            Console.WriteLine($"Progress: executing node {lastReportedNode}");
            _ = hubClient.ReportProgressAsync(targetJobId, $"Executing node {lastReportedNode}");
        }
    };
    progressTimer.Start();

    try
    {
        Console.WriteLine("Executing flow...");
        result = await engine.ExecuteAsync(graph, cts.Token, nodeId =>
        {
            lastReportedNode = nodeId;
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

    Console.WriteLine($"Closing job with status: {jobStatus}");
    try
    {
        await backendClient.CloseJobAsync(targetJobId, result.Status, result.NodeLogs.ToList());
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Warning: Failed to close job: {ex.Message}");
    }

    progressTimer.Stop();
    progressTimer.Dispose();

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

static bool IsDotNet8RuntimeInstalled()
{
    try
    {
        // Prefer the registry: .NET host stores installed runtime versions under
        // HKLM\SOFTWARE\dotnet\Setup\InstalledVersions\x64\sharedHost on 64-bit Windows.
        using var baseKey = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(@"SOFTWARE\dotnet\Setup\InstalledVersions\x64");
        if (baseKey?.GetValue("sharedHost") is string sharedHostValue && !string.IsNullOrWhiteSpace(sharedHostValue))
        {
            return true;
        }

        // Fallback: run `dotnet --list-runtimes` and look for a .NET 8 runtime line.
        using var process = new System.Diagnostics.Process();
        process.StartInfo.FileName = "dotnet";
        process.StartInfo.Arguments = "--list-runtimes";
        process.StartInfo.UseShellExecute = false;
        process.StartInfo.RedirectStandardOutput = true;
        process.StartInfo.RedirectStandardError = true;
        process.StartInfo.CreateNoWindow = true;
        process.Start();

        var output = process.StandardOutput.ReadToEnd();
        process.WaitForExit(5000);

        foreach (var line in output.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries))
        {
            if (line.StartsWith("Microsoft.NETCore.App 8.", StringComparison.OrdinalIgnoreCase) ||
                line.StartsWith("Microsoft.WindowsDesktop.App 8.", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }
    catch
    {
        // If the check itself fails (e.g. registry access denied, dotnet not on PATH),
        // assume the runtime is present so we don't block a valid install unnecessarily.
        return true;
    }
}

static void PrintDotNet8PrerequisiteError()
{
    Console.Error.WriteLine("Error: .NET 8 runtime is not installed on this machine.");
    Console.Error.WriteLine("Install it before registering the AvintraDesktopRunner service.");
    Console.Error.WriteLine();
    Console.Error.WriteLine("Option 1 - winget (recommended):");
    Console.Error.WriteLine("  winget install Microsoft.DotNet.Runtime.8 --source winget");
    Console.Error.WriteLine();
    Console.Error.WriteLine("Option 2 - Manual:");
    Console.Error.WriteLine("  https://dotnet.microsoft.com/download/dotnet/8.0/runtime");
    Console.Error.WriteLine();
    Console.Error.WriteLine("If you are certain the runtime is installed, re-run with --skip-runtime-check.");
}

static int RunServiceInstaller(string[] args, bool install)
{
    try
    {
        var serviceName = "AvintraDesktopRunner";
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
            var skipRuntimeCheck = args.Contains("--skip-runtime-check", StringComparer.OrdinalIgnoreCase);
            if (!skipRuntimeCheck && !IsDotNet8RuntimeInstalled())
            {
                PrintDotNet8PrerequisiteError();
                return 2;
            }

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

static DesktopExecutorOptions? TryParseInstallArguments(string[] args)
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

    return new DesktopExecutorOptions
    {
        AppBaseUrl = appBaseUrl,
        ApiKey = apiKey,
        TenantId = tenantId,
        LinkedUsername = linkedUsername,
    };
}

static DesktopExecutorOptions? PromptForInstallParameters()
{
    Console.WriteLine("Install AvintraDesktopRunner as a Windows service.");
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

    return new DesktopExecutorOptions
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

static string BuildServiceBinPath(string executablePath, DesktopExecutorOptions options)
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

static DesktopExecutorOptions? ParseRunArguments(string[] args)
{
    string? appBaseUrl = null;
    string? accessToken = null;
    Guid? jobId = null;
    string? osId = null;
    string? username = null;
    string? appVersion = null;
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
            case "--accesstoken":
                if (++i < args.Length) accessToken = args[i];
                break;
            case "--jobid":
                if (++i < args.Length && Guid.TryParse(args[i], out var id)) jobId = id;
                break;
            case "--osid":
                if (++i < args.Length) osId = args[i];
                break;
            case "--username":
                if (++i < args.Length) username = args[i];
                break;
            case "--appversion":
                if (++i < args.Length) appVersion = args[i];
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

    return new DesktopExecutorOptions
    {
        AppBaseUrl = appBaseUrl,
        AccessToken = accessToken ?? string.Empty,
        JobId = jobId,
        OsId = osId ?? Environment.MachineName,
        Username = username ?? Environment.UserName,
        AppVersion = appVersion ?? "1.0.0",
        ApiKey = apiKey ?? string.Empty,
        TenantId = tenantId ?? string.Empty,
        LinkedUsername = linkedUsername ?? string.Empty,
    };
}

static void PrintUsage()
{
    Console.Error.WriteLine("Usage:");
    Console.Error.WriteLine("  DesktopExecutor --install                              Install as Windows service (interactive)");
    Console.Error.WriteLine("  DesktopExecutor --install --appBaseUrl <url> --apiKey <key> --tenantId <id> --linkedUsername <user>");
    Console.Error.WriteLine("                                                         Install as Windows service (silent)");
    Console.Error.WriteLine("  DesktopExecutor --uninstall                            Uninstall Windows service");
    Console.Error.WriteLine("  DesktopExecutor --run --appBaseUrl <url> [options]     Run once (console)");
    Console.Error.WriteLine("  DesktopExecutor --run --service [options]              Run as Windows service");
    Console.Error.WriteLine("");
    Console.Error.WriteLine("Install options (for silent install):");
    Console.Error.WriteLine("  --appBaseUrl <url>       Backend API base URL (required)");
    Console.Error.WriteLine("  --apiKey <key>           Tenant API key (required)");
    Console.Error.WriteLine("  --tenantId <guid>        Tenant ID (required)");
    Console.Error.WriteLine("  --linkedUsername <name>  Linked workspace username (required)");
    Console.Error.WriteLine("  --skip-runtime-check     Skip the .NET 8 runtime prerequisite check");
    Console.Error.WriteLine("");
    Console.Error.WriteLine("Run options:");
    Console.Error.WriteLine("  --appBaseUrl <url>       Backend API base URL (required)");
    Console.Error.WriteLine("  --accessToken <token>    JWT access token (console mode)");
    Console.Error.WriteLine("  --jobId <guid>           Job ID to execute (console mode; optional in service mode)");
    Console.Error.WriteLine("  --osId <id>              Machine OS identifier (default: machine name)");
    Console.Error.WriteLine("  --username <name>        Machine username (default: current user)");
    Console.Error.WriteLine("  --appVersion <ver>       App version (default: 1.0.0)");
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
