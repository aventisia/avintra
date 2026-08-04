using DesktopExecutor.Services;
using ExecutorLibrary.FlowProcessor.Models;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace DesktopExecutor;

/// <summary>
/// Continuous worker that keeps the machine registered with the backend, stays connected to the
/// OrchestratorHub, and executes any job it is assigned. Runs for the lifetime of the Windows service.
/// </summary>
public class DesktopExecutorService : BackgroundService
{
    private readonly DesktopExecutorOptions _options;
    private readonly ILogger<DesktopExecutorService> _logger;
    private readonly ILoggerFactory _loggerFactory;

    // Cancellation source for the job currently being executed; cancelled when an Abort/Killed command arrives.
    private CancellationTokenSource? _activeJobCts;

    public DesktopExecutorService(
        DesktopExecutorOptions options,
        ILogger<DesktopExecutorService> logger,
        ILoggerFactory loggerFactory)
    {
        _options = options;
        _logger = logger;
        _loggerFactory = loggerFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DesktopExecutorService started in {Mode} mode.", _options.IsServiceMode ? "service" : "single-shot");

        var cts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);

        try
        {
            while (!cts.Token.IsCancellationRequested)
            {
                try
                {
                    await RunWorkerCycleAsync(cts.Token);

                    // In single-shot mode (fixed JobId) run exactly one job and exit.
                    if (_options.JobId.HasValue)
                        break;

                    _logger.LogInformation("Worker cycle completed. Waiting for the next job assignment...");
                }
                catch (OperationCanceledException) when (cts.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Worker cycle failed. Retrying in 15 seconds.");
                    await Task.Delay(TimeSpan.FromSeconds(15), cts.Token);
                }
            }
        }
        finally
        {
            cts.Dispose();
        }

        _logger.LogInformation("DesktopExecutorService stopped.");
    }

    // One cycle: register machine, connect to hub, wait for a job command, execute it, report completion.
    private async Task RunWorkerCycleAsync(CancellationToken cancellationToken)
    {
        using var registerHttpClient = new HttpClient { BaseAddress = new Uri(_options.AppBaseUrl) };
        var registerClient = new BackendHttpClient(registerHttpClient, _options.AccessToken);

        // Register the machine and obtain a machine JWT. Long-lived (API-key) registration is
        // refreshed each cycle; JWT registration is used for single-shot console runs.
        var registration = await RegisterMachineAsync(registerClient, cancellationToken);
        var accessToken = registration?.Jwt ?? _options.AccessToken;
        if (registration != null)
            _logger.LogInformation("Registered as machine {MachineId}.", registration.MachineId);
        else
            _logger.LogWarning("Machine registration failed. Continuing with the provided token.");

        using var httpClient = new HttpClient { BaseAddress = new Uri(_options.AppBaseUrl) };
        var backendClient = new BackendHttpClient(httpClient, accessToken);
        var engine = new DesktopExecutionEngine(accessToken);

        var hubLogger = _loggerFactory.CreateLogger<OrchestratorHubClient>();
        await using var hubClient = new OrchestratorHubClient(
            _options.AppBaseUrl,
            accessToken,
            _options.OsId,
            _options.Username,
            _options.AppVersion,
            hubLogger);

        var commandReceived = new TaskCompletionSource<ExecutorCommandReceivedEventArgs?>(TaskCreationOptions.RunContinuationsAsynchronously);
        var pauseResume = new ManualResetEventSlim(true);

        hubClient.CommandReceived += (_, e) =>
        {
            if (e.Command == ExecutorCommand.Initiate)
            {
                commandReceived.TrySetResult(e);
            }
            else if (e.Command == ExecutorCommand.Abort || e.Command == ExecutorCommand.Killed)
            {
                pauseResume.Set();
                _activeJobCts?.Cancel();
                commandReceived.TrySetResult(null);
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
            _logger.LogWarning("SignalR disconnected: {Reason}.", reason);
            commandReceived.TrySetResult(null);
        };

        // Connect (with retry) and wait for the next job command.
        await ConnectHubWithRetryAsync(hubClient, cancellationToken);

        if (_options.JobId.HasValue)
        {
            // Single-shot mode: execute the explicitly requested job.
            await ExecuteJobAsync(backendClient, engine, hubClient, _options.JobId.Value, cancellationToken);
            return;
        }

        // Service mode: wait for an Initiate command, execute the assigned job, then loop.
        var command = await WaitForCommandAsync(commandReceived, hubClient, cancellationToken);
        if (command != null)
        {
            await ExecuteJobAsync(backendClient, engine, hubClient, command.JobId, cancellationToken);
        }

        await hubClient.DisconnectAsync();
    }

    private async Task<MachineRegistrationResult?> RegisterMachineAsync(BackendHttpClient registerClient, CancellationToken cancellationToken)
    {
        if (_options.IsServiceMode)
        {
            // Long-lived registration using the tenant API key. Refreshed each cycle.
            return await registerClient.RegisterMachineWithApiKeyAsync(
                "Windows", _options.OsId, _options.Username, Environment.MachineName,
                _options.TenantId, _options.ApiKey, _options.LinkedUsername, cancellationToken);
        }

        return await registerClient.RegisterMachineAsync(
            "Windows", _options.OsId, _options.Username, Environment.MachineName, cancellationToken);
    }

    private async Task ConnectHubWithRetryAsync(IOrchestratorHubClient hubClient, CancellationToken cancellationToken)
    {
        const int maxAttempts = 5;
        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                _logger.LogInformation("Connecting to OrchestratorHub (attempt {Attempt}/{MaxAttempts})...", attempt, maxAttempts);
                await hubClient.ConnectAsync(cancellationToken);
                return;
            }
            catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning(ex, "Failed to connect to OrchestratorHub (attempt {Attempt}/{MaxAttempts}).", attempt, maxAttempts);
                if (attempt == maxAttempts)
                    throw;
                await Task.Delay(TimeSpan.FromSeconds(5 * attempt), cancellationToken);
            }
        }
    }

    private async Task<ExecutorCommandReceivedEventArgs?> WaitForCommandAsync(
        TaskCompletionSource<ExecutorCommandReceivedEventArgs?> commandReceived,
        IOrchestratorHubClient hubClient,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Waiting for a job command from the OrchestratorHub...");
        var command = await commandReceived.Task.WaitAsync(cancellationToken);

        // If the hub disconnected before a command arrived, attempt to reconnect.
        while (command is null && hubClient.ConnectionState == Microsoft.AspNetCore.SignalR.Client.HubConnectionState.Disconnected)
        {
            _logger.LogInformation("Hub disconnected while waiting for a command. Reconnecting...");
            try
            {
                await hubClient.ConnectAsync(cancellationToken);
            }
            catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
            {
                _logger.LogWarning(ex, "Reconnect failed. Retrying in 10 seconds.");
                await Task.Delay(TimeSpan.FromSeconds(10), cancellationToken);
                continue;
            }

            commandReceived = new TaskCompletionSource<ExecutorCommandReceivedEventArgs?>(TaskCreationOptions.RunContinuationsAsynchronously);
            command = await commandReceived.Task.WaitAsync(cancellationToken);
        }

        return command;
    }

    private async Task ExecuteJobAsync(
        BackendHttpClient backendClient,
        IExecutionEngine engine,
        IOrchestratorHubClient hubClient,
        Guid targetJobId,
        CancellationToken cancellationToken)
    {
        var jobCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        _activeJobCts = jobCts;
        try
        {
            _logger.LogInformation("Fetching execution graph for job {JobId}...", targetJobId);
            var graph = await backendClient.GetExecutionGraphAsync(targetJobId, cancellationToken);
            if (graph is null)
            {
                _logger.LogError("Execution graph not found for job {JobId}.", targetJobId);
                return;
            }

            _logger.LogInformation("Marking job {JobId} as running...", targetJobId);
            try
            {
                await backendClient.StartJobAsync(targetJobId, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to mark job {JobId} as running. Continuing execution anyway.", targetJobId);
            }

            FlowExecutionResult result;
            var lastReportedNode = string.Empty;
            using var progressCts = CancellationTokenSource.CreateLinkedTokenSource(jobCts.Token);
            var progressTask = RunProgressReporterAsync(
                hubClient,
                targetJobId,
                () => lastReportedNode,
                TimeSpan.FromSeconds(15),
                progressCts.Token);

            try
            {
                _logger.LogInformation("Executing flow for job {JobId}...", targetJobId);
                result = await engine.ExecuteAsync(graph, jobCts.Token, nodeId => lastReportedNode = nodeId);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Execution cancelled for job {JobId}.", targetJobId);
                result = new FlowExecutionResult
                {
                    IsSuccess = false,
                    Status = FlowExecutionStatus.Aborted,
                    StartTime = DateTimeOffset.UtcNow,
                    EndTime = DateTimeOffset.UtcNow,
                    ErrorMessage = "Execution aborted.",
                    NodeLogs = []
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Execution failed for job {JobId}.", targetJobId);
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

            progressCts.Cancel();
            try { await progressTask; }
            catch (OperationCanceledException) { /* expected when execution finishes */ }

            _logger.LogInformation("Closing job {JobId} with status {Status}.", targetJobId, jobStatus);
            try
            {
                await backendClient.CloseJobAsync(targetJobId, result.Status, result.NodeLogs.ToList(), cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to close job {JobId}.", targetJobId);
            }

            await hubClient.ReportCompletionAsync(targetJobId, jobStatus, result.ErrorMessage, cancellationToken);

            _logger.LogInformation("Execution finished for job {JobId}: {Status}.", targetJobId, result.Status);
        }
        finally
        {
            _activeJobCts = null;
            jobCts.Dispose();
        }
    }

    private async Task RunProgressReporterAsync(
        IOrchestratorHubClient hubClient,
        Guid jobId,
        Func<string> getCurrentNode,
        TimeSpan interval,
        CancellationToken cancellationToken)
    {
        using var timer = new PeriodicTimer(interval);

        while (await timer.WaitForNextTickAsync(cancellationToken))
        {
            try
            {
                var node = getCurrentNode();
                if (!string.IsNullOrEmpty(node))
                {
                    await hubClient.ReportProgressAsync(jobId, $"Executing node {node}", cancellationToken);
                }
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to report progress for job {JobId}.", jobId);
            }
        }
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        _logger.LogInformation("DesktopExecutorService stopping...");
        await base.StopAsync(cancellationToken);
    }
}
