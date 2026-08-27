namespace RunnerApp;

using RunnerApp.Services;

/// <summary>
/// Continuous worker that keeps the machine registered with the backend, stays connected to the
/// OrchestratorHub, and executes any job it is assigned. Runs for the lifetime of the Windows service.
/// </summary>
public class RunnerAppService : BackgroundService
{
    private readonly RunnerAppOptions _options;
    private readonly ILogger<RunnerAppService> _logger;
    private readonly ILoggerFactory _loggerFactory;

    // Cancellation source for the job currently being executed; cancelled when an Abort/Killed command arrives.
    private CancellationTokenSource? _activeJobCts;

    // Process manager for the current worker; null when no job is running.
    private WorkerProcessManager? _workerManager;

    public RunnerAppService(
        RunnerAppOptions options,
        ILogger<RunnerAppService> logger,
        ILoggerFactory loggerFactory)
    {
        _options = options;
        _logger = logger;
        _loggerFactory = loggerFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("RunnerAppService started in {Mode} mode.", _options.IsServiceMode ? "service" : "single-shot");
        DebugLog.Info($"RunnerAppService started in {(_options.IsServiceMode ? "service" : "single-shot")} mode. Logs: {DebugLog.CurrentLogFilePath}");

        var cts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken);

        try
        {
            // Connect once and stay connected for the lifetime of the service. Job execution
            // is handled inside the hub command handler, so the service remains online and
            // ready for Abort/Killed commands between jobs.
            await RunHubListenerAsync(cts.Token);
        }
        catch (OperationCanceledException) when (cts.IsCancellationRequested)
        {
            // Expected on service stop.
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RunnerAppService hub listener failed unexpectedly.");
            DebugLog.Error("RunnerAppService hub listener failed unexpectedly.", ex);
        }
        finally
        {
            cts.Dispose();
        }

        _logger.LogInformation("RunnerAppService stopped.");
    }

    // Long-lived listener: registers the machine, connects to the hub, and stays connected.
    // Commands are dispatched directly to ExecuteJobAsync; the connection is only rebuilt when
    // it drops.
    private async Task RunHubListenerAsync(CancellationToken cancellationToken)
    {
        using var registerHttpClient = new HttpClient { BaseAddress = new Uri(_options.AppBaseUrl) };
        var registerClient = new BackendHttpClient(registerHttpClient, _options.AccessToken);

        var registration = await RegisterMachineAsync(registerClient, cancellationToken);
        var accessToken = registration?.Jwt ?? _options.AccessToken;
        if (registration != null)
            _logger.LogInformation("Registered as machine {MachineId}.", registration.MachineId);
        else
            _logger.LogWarning("Machine registration failed. Continuing with the provided token.");

        using var httpClient = new HttpClient { BaseAddress = new Uri(_options.AppBaseUrl) };
        var backendClient = new BackendHttpClient(httpClient, accessToken);

        var hubLogger = _loggerFactory.CreateLogger<OrchestratorHubClient>();

        // Service mode has no reliable interactive session, so use the service account username
        // for hub identity. This keeps the machine identity stable across session changes.
        var hubUsername = _options.IsServiceMode
            ? MachineIdentity.ServiceAccountUsername
            : null;

        await using var hubClient = new OrchestratorHubClient(
            _options.AppBaseUrl,
            accessToken,
            hubLogger,
            hubUsername);

        var commandReceived = new TaskCompletionSource<ExecutorCommandReceivedEventArgs?>(TaskCreationOptions.RunContinuationsAsynchronously);

        hubClient.CommandReceived += (_, e) =>
        {
            if (e.Command == ExecutorCommand.Initiate)
            {
                commandReceived.TrySetResult(e);
            }
            else if (e.Command == ExecutorCommand.Abort || e.Command == ExecutorCommand.Killed)
            {
                _activeJobCts?.Cancel();
                _workerManager?.KillWorker();
                commandReceived.TrySetResult(null);
            }
            else if (e.Command == ExecutorCommand.Pause)
            {
                // Pause/resume is not forwarded to the worker in this version.
                _logger.LogInformation("Pause command received but not implemented for worker processes.");
            }
            else if (e.Command == ExecutorCommand.Resume)
            {
                _logger.LogInformation("Resume command received but not implemented for worker processes.");
            }
        };

        hubClient.Reconnected += (_, _) =>
        {
            _logger.LogInformation("Service reconnected to OrchestratorHub after a temporary disconnect.");
        };

        hubClient.Disconnected += (_, reason) =>
        {
            _logger.LogWarning("Service is OFFLINE — SignalR disconnected: {Reason}.", reason);
            DebugLog.Warn($"SignalR disconnected: {reason}");
            commandReceived.TrySetResult(null);
        };

        await ConnectHubWithRetryAsync(hubClient, cancellationToken);

        _logger.LogInformation("Service is ONLINE — connected to OrchestratorHub.");
        DebugLog.Info($"Service is ONLINE — connected to OrchestratorHub as {MachineIdentity.ServiceAccountUsername} ({hubUsername}).");

        if (_options.JobId.HasValue)
        {
            // Single-shot mode: execute the explicitly requested job and exit.
            await ExecuteJobAsync(backendClient, hubClient, _options.JobId.Value, accessToken, cancellationToken);
            return;
        }

        var machineId = registration?.MachineId ?? Guid.Empty;

        // Drain any jobs that became pending while this runner was offline.
        await DrainPendingJobsAsync(backendClient, hubClient, machineId, accessToken, cancellationToken);

        // Service mode: keep listening for commands and execute each assigned job.
        // Also poll periodically for pending work so missed SignalR events and new
        // time-trigger jobs do not sit idle.
        while (!cancellationToken.IsCancellationRequested)
        {
            var command = await WaitForCommandAsync(commandReceived, hubClient, TimeSpan.FromSeconds(30), cancellationToken);
            if (command == null)
            {
                _logger.LogInformation("No job request received; polling for pending jobs.");
                await DrainPendingJobsAsync(backendClient, hubClient, machineId, accessToken, cancellationToken);
                continue;
            }

            // Reset the command source before executing so that any new Initiate
            // commands received during execution are captured for the next loop.
            commandReceived = new TaskCompletionSource<ExecutorCommandReceivedEventArgs?>(TaskCreationOptions.RunContinuationsAsynchronously);

            _logger.LogInformation("Job request received: {JobId}. Starting execution...", command.JobId);
            DebugLog.Info($"Job request received: {command.JobId}. Starting execution...");
            await ExecuteJobAsync(backendClient, hubClient, command.JobId, accessToken, cancellationToken);

            // After finishing a job, keep pulling any additional pending jobs until none remain.
            await DrainPendingJobsAsync(backendClient, hubClient, machineId, accessToken, cancellationToken);
        }
    }

    // Repeatedly asks the backend for the next pending job for this machine and executes it
    // until the queue for this machine is empty. This is the primary drain mechanism that
    // handles burst-created time-trigger jobs and missed SignalR events.
    private async Task DrainPendingJobsAsync(
        BackendHttpClient backendClient,
        IOrchestratorHubClient hubClient,
        Guid machineId,
        string accessToken,
        CancellationToken cancellationToken)
    {
        if (machineId == Guid.Empty)
        {
            _logger.LogWarning("Cannot drain pending jobs: machine ID is empty.");
            return;
        }

        while (!cancellationToken.IsCancellationRequested)
        {
            Guid? nextJobId;
            try
            {
                nextJobId = await backendClient.GetNextPendingJobAsync(machineId, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to query next pending job for machine {MachineId}.", machineId);
                DebugLog.Warn($"Failed to query next pending job for machine {machineId}: {ex.Message}");
                break;
            }

            if (!nextJobId.HasValue || nextJobId.Value == Guid.Empty)
            {
                _logger.LogInformation("No pending jobs remaining for machine {MachineId}.", machineId);
                break;
            }

            _logger.LogInformation("Draining pending job {JobId} for machine {MachineId}.", nextJobId.Value, machineId);
            DebugLog.Info($"Draining pending job {nextJobId.Value} for machine {machineId}.");
            await ExecuteJobAsync(backendClient, hubClient, nextJobId.Value, accessToken, cancellationToken);
        }
    }

    private async Task<MachineRegistrationResult?> RegisterMachineAsync(BackendHttpClient registerClient, CancellationToken cancellationToken)
    {
        // Service mode has no reliable interactive session; use the service account username
        // (e.g. THINKPAD$) so the backend machine lookup stays stable.
        var registrationUsername = _options.IsServiceMode
            ? MachineIdentity.ServiceAccountUsername
            : MachineIdentity.Username;

        if (_options.IsServiceMode)
        {
            // Long-lived registration using the tenant API key. Refreshed each cycle.
            return await registerClient.RegisterMachineWithApiKeyAsync(
                "Windows", MachineIdentity.OsId, registrationUsername, MachineIdentity.Hostname,
                _options.TenantId, _options.ApiKey, _options.LinkedUsername, cancellationToken);
        }

        return await registerClient.RegisterMachineAsync(
            "Windows", MachineIdentity.OsId, registrationUsername, MachineIdentity.Hostname, cancellationToken);
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
        TimeSpan pollInterval,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation("Service ONLINE and waiting for a job request from the OrchestratorHub...");

        using var timeoutCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeoutCts.CancelAfter(pollInterval);

        ExecutorCommandReceivedEventArgs? command;
        try
        {
            command = await commandReceived.Task.WaitAsync(timeoutCts.Token);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            // Polling interval elapsed with no command; return null so the caller can drain.
            return null;
        }

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
        IOrchestratorHubClient hubClient,
        Guid targetJobId,
        string accessToken,
        CancellationToken cancellationToken)
    {
        using var jobLog = DebugLog.StartJobSession(targetJobId);
        WorkerResultSerializer.Delete(targetJobId);
        var jobCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        _activeJobCts = jobCts;
        WorkerProcessManager? manager = null;

        try
        {
            _logger.LogInformation("Fetching execution graph for job {JobId}...", targetJobId);
            jobLog.Info($"Fetching execution graph for job {targetJobId}...");
            var graph = await backendClient.GetExecutionGraphAsync(targetJobId, cancellationToken);
            if (graph is null)
            {
                _logger.LogError("Execution graph not found for job {JobId}.", targetJobId);
                jobLog.Error("Execution graph not found.");
                await hubClient.ReportCompletionAsync(targetJobId, "Failed", "Execution graph not found.", cancellationToken);
                return;
            }

            _logger.LogInformation("Marking job {JobId} as running...", targetJobId);
            jobLog.Info($"Marking job {targetJobId} as running...");
            try
            {
                await backendClient.StartJobAsync(targetJobId, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to mark job {JobId} as running. Continuing execution anyway.", targetJobId);
                jobLog.Warn($"Failed to mark job {targetJobId} as running. Continuing execution anyway: {ex.Message}");
            }

            // Spawn a worker process to execute the job. The service stays connected to the hub
            // so it can receive Abort/Killed commands and relay completion to the user.
            var executablePath = Environment.ProcessPath
                ?? throw new InvalidOperationException("Cannot determine the runner executable path.");

            manager = new WorkerProcessManager(executablePath, _options.Unattended);
            _workerManager = manager;
            jobLog.Info($"Starting worker process for job {targetJobId}.");
            manager.StartWorker(targetJobId, _options.AppBaseUrl, accessToken);

            var outcome = "Completed";
            string? outcomeMessage = null;
            WorkerExitResult? workerResult = null;
            try
            {
                workerResult = await manager.WaitForExitAsync(jobCts.Token);
                outcome = workerResult.SuggestedStatus;
                outcomeMessage = workerResult.Summary;
                jobLog.Info($"Worker exited with code {workerResult.ExitCode}, suggested status {outcome}.");
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Execution cancelled for job {JobId}.", targetJobId);
                jobLog.Warn($"Execution cancelled for job {targetJobId}.");
                outcome = "Aborted";
                outcomeMessage = "Execution aborted by runner.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Execution failed for job {JobId}.", targetJobId);
                jobLog.Error($"Execution failed for job {targetJobId}: {ex.Message}");
                outcome = "Failed";
                outcomeMessage = ex.Message;
            }

            // Log whatever the worker printed so we can diagnose short/cryptic exits.
            if (workerResult is not null)
            {
                if (!string.IsNullOrWhiteSpace(workerResult.StandardOutput))
                    jobLog.Info($"Worker stdout for job {targetJobId}:\n{workerResult.StandardOutput.Trim()}");
                if (!string.IsNullOrWhiteSpace(workerResult.StandardError))
                    jobLog.Warn($"Worker stderr for job {targetJobId}:\n{workerResult.StandardError.Trim()}");
            }

            // Try to load the full execution result the worker wrote. If present, use its node
            // logs and error message when closing the job so the orchestrator shows per-node
            // outcomes and the failed node's status. Fall back to the process-exit summary when
            // the result file is missing (e.g., worker crash or abnormal termination).
            FlowExecutionResult? workerFlowResult = null;
            try
            {
                workerFlowResult = await WorkerResultSerializer.LoadAsync(targetJobId);
                if (workerFlowResult is not null)
                {
                    jobLog.Info($"Loaded worker result for job {targetJobId}: {workerFlowResult.NodeLogs.Count} node logs, status {workerFlowResult.Status}.");
                }
                else
                {
                    jobLog.Warn($"No worker result file found for job {targetJobId}; using process exit summary.");
                }
            }
            catch (Exception ex)
            {
                jobLog.Warn($"Failed to load worker result for job {targetJobId}: {ex.Message}");
            }

            var nodeLogs = workerFlowResult?.NodeLogs?.ToList() ?? new List<NodeExecutionLog>();

            var flowStatus = outcome switch
            {
                "Completed" => FlowExecutionStatus.Completed,
                "Aborted" => FlowExecutionStatus.Aborted,
                _ => workerFlowResult?.Status ?? FlowExecutionStatus.Failed,
            };

            _logger.LogInformation("Closing job {JobId} with status {Status}.", targetJobId, outcome);
            jobLog.Info($"Closing job {targetJobId} with status {outcome}.");
            try
            {
                string? closeRemarks;
                if (flowStatus == FlowExecutionStatus.Failed)
                {
                    closeRemarks = workerFlowResult is not null
                        ? BackendHttpClient.BuildFailedNodeRemark(nodeLogs, workerFlowResult.ErrorMessage)
                        : outcomeMessage;
                }
                else if (flowStatus == FlowExecutionStatus.Aborted)
                {
                    closeRemarks = "Job aborted by runner.";
                }
                else
                {
                    closeRemarks = null;
                }

                await backendClient.CloseJobAsync(targetJobId, flowStatus, nodeLogs, closeRemarks, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to close job {JobId}.", targetJobId);
                jobLog.Warn($"Failed to close job {targetJobId}: {ex.Message}");
            }

            await hubClient.ReportCompletionAsync(targetJobId, outcome, outcomeMessage, cancellationToken);

            var logOutcome = outcome == "Completed" ? "completed successfully" : "failed";
            _logger.LogInformation("Job {JobId} {Outcome}.", targetJobId, logOutcome);
            jobLog.Info($"Job {targetJobId} {logOutcome}.");
        }
        finally
        {
            _activeJobCts = null;
            _workerManager = null;
            jobCts.Dispose();

            if (manager is not null)
            {
                await manager.DisposeAsync();
            }
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
        _logger.LogInformation("RunnerAppService stopping...");
        await base.StopAsync(cancellationToken);
    }
}
