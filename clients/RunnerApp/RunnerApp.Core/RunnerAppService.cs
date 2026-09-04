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

    // Queue of Initiate commands received from the OrchestratorHub. A channel (instead of a
    // one-shot TaskCompletionSource) guarantees that commands arriving while a job executes,
    // while pending jobs are drained, or across hub reconnects are never dropped: they wait
    // here until the main loop consumes them.
    private readonly Channel<ExecutorCommandReceivedEventArgs> _commandChannel =
        Channel.CreateUnbounded<ExecutorCommandReceivedEventArgs>(
            new UnboundedChannelOptions { SingleReader = true });

    // Machine JWT manager (service/hub listener modes) and the OS username the machine was
    // registered under, which workers need to renew their own JWTs.
    private MachineTokenManager? _tokenManager;
    private string? _registrationUsername;

    public RunnerAppService(
        RunnerAppOptions options,
        ILogger<RunnerAppService> logger,
        ILoggerFactory loggerFactory)
    {
        _options = options;
        _logger = logger;
        _loggerFactory = loggerFactory;
    }

    // Trigger that the Windows service host can pulse when OS network availability changes.
    // This lets the service reconnect immediately after sleep/wake or network restore instead
    // of waiting for the next poll/backoff cycle. A new token source is created each listener
    // iteration so multiple network events over the service lifetime keep working.
    private CancellationTokenSource _reconnectCts = new();
    private readonly object _reconnectLock = new();

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("RunnerAppService started in {Mode} mode.", _options.IsServiceMode ? "service" : "single-shot");
        DebugLog.Info($"RunnerAppService started in {(_options.IsServiceMode ? "service" : "single-shot")} mode. Logs: {DebugLog.CurrentLogFilePath}");

        var consecutiveFailures = 0;

        while (!stoppingToken.IsCancellationRequested)
        {
            CancellationTokenSource reconnectCts;
            lock (_reconnectLock)
            {
                reconnectCts = _reconnectCts;
            }

            using var cts = CancellationTokenSource.CreateLinkedTokenSource(stoppingToken, reconnectCts.Token);

            try
            {
                // Connect and stay connected for the lifetime of the service (or until an
                // unrecoverable failure). Job execution is handled inside the hub command
                // handler, so the service remains online and ready for Abort/Killed commands
                // between jobs.
                await RunHubListenerAsync(cts.Token);

                // Normal exit means single-shot mode finished, or cancellation was requested.
                break;
            }
            catch (OperationCanceledException) when (reconnectCts.IsCancellationRequested && !stoppingToken.IsCancellationRequested)
            {
                // Reconnect was deliberately triggered by the OS network event. Restart the
                // listener immediately so we reconnect without waiting for the backoff timer.
                _logger.LogInformation("RunnerAppService reconnect triggered; restarting hub listener now.");
                DebugLog.Info("RunnerAppService reconnect triggered; restarting hub listener now.");
                consecutiveFailures = 0;
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Expected on service stop.
                break;
            }
            catch (Exception ex)
            {
                consecutiveFailures++;
                _logger.LogError(ex, "RunnerAppService hub listener failed unexpectedly. Restarting...");
                DebugLog.Error("RunnerAppService hub listener failed unexpectedly. Restarting...", ex);
            }

            // Reset the reconnect trigger so future OS network events can be observed.
            lock (_reconnectLock)
            {
                if (_reconnectCts == reconnectCts)
                {
                    _reconnectCts.Dispose();
                    _reconnectCts = new();
                }
            }

            if (stoppingToken.IsCancellationRequested)
                break;

            // Exponential backoff between restarts, capped at 60s, with jitter. Skipped when
            // the restart was triggered by an OS network event.
            var delaySeconds = Math.Min(60, 5 * Math.Pow(2, consecutiveFailures - 1));
            var jitterMs = Random.Shared.Next(0, 500);
            var delay = TimeSpan.FromSeconds(delaySeconds) + TimeSpan.FromMilliseconds(jitterMs);
            _logger.LogInformation("RunnerAppService will restart the hub listener in {DelaySeconds:F0}s.", delay.TotalSeconds);
            DebugLog.Info($"RunnerAppService will restart the hub listener in {delay.TotalSeconds:F0}s.");
            await Task.Delay(delay, stoppingToken);
        }

        lock (_reconnectLock)
        {
            try
            {
                _reconnectCts.Dispose();
            }
            catch
            {
                // Best effort.
            }
        }

        _logger.LogInformation("RunnerAppService stopped.");
    }

    /// <summary>
    /// Signals the service to attempt an immediate hub reconnect. Called by the Windows host
    /// when the OS reports network availability has changed. Safe to call from any thread; the
    /// signal is ignored when no listener is currently waiting.
    /// </summary>
    public void TriggerReconnect()
    {
        lock (_reconnectLock)
        {
            try
            {
                if (_reconnectCts.IsCancellationRequested)
                    return;
            }
            catch (ObjectDisposedException)
            {
                // Service is shutting down; ignore.
                return;
            }

            DebugLog.Info("RunnerAppService reconnect triggered by OS network availability change.");
            _logger.LogInformation("RunnerAppService reconnect triggered by OS network availability change.");

            try
            {
                _reconnectCts.Cancel();
            }
            catch (ObjectDisposedException)
            {
                // Service is shutting down; ignore.
            }
        }
    }

    // Long-lived listener: registers the machine, connects to the hub, and stays connected.
    // Commands are dispatched directly to ExecuteJobAsync; the connection is only rebuilt when
    // it drops.
    private async Task RunHubListenerAsync(CancellationToken cancellationToken)
    {
        using var registerHttpClient = new HttpClient { BaseAddress = new Uri(_options.AppBaseUrl) };
        var registerClient = new BackendHttpClient(registerHttpClient, _options.AccessToken);

        // Service mode has no reliable interactive session; use the service account username
        // (e.g. THINKPAD$) so the backend machine lookup stays stable.
        var registrationUsername = _options.IsServiceMode
            ? MachineIdentity.ServiceAccountUsername
            : MachineIdentity.Username;
        _registrationUsername = registrationUsername;

        var registration = await RegisterMachineAsync(registerClient, registrationUsername, cancellationToken);
        var accessToken = registration?.Jwt ?? _options.AccessToken;
        if (registration != null)
            _logger.LogInformation("Registered as machine {MachineId}.", registration.MachineId);
        else
            _logger.LogWarning("Machine registration failed. Continuing with the provided token.");

        // The token manager keeps the machine JWT fresh: every backend call and hub connect
        // asks it for a token, which triggers a refresh when the token is expired or expires
        // within the refresh threshold. Without it the JWT expires after JwtValidityInMinutes
        // and a later reconnect is rejected with 401, leaving the machine Offline until the
        // service is restarted.
        MachineTokenManager? tokenManager = null;
        if (registration is not null)
        {
            tokenManager = new MachineTokenManager(
                registration,
                (currentJwt, ct) => RefreshMachineTokenAsync(registerClient, currentJwt, registrationUsername, ct),
                _logger);
            _tokenManager = tokenManager;
        }

        using var httpClient = new HttpClient { BaseAddress = new Uri(_options.AppBaseUrl) };
        var backendClient = tokenManager is not null
            ? new BackendHttpClient(httpClient, tokenManager)
            : new BackendHttpClient(httpClient, accessToken);

        var hubLogger = _loggerFactory.CreateLogger<OrchestratorHubClient>();

        // Service mode has no reliable interactive session, so use the service account username
        // for hub identity. This keeps the machine identity stable across session changes.
        var hubUsername = _options.IsServiceMode
            ? MachineIdentity.ServiceAccountUsername
            : null;

        await using var hubClient = tokenManager is not null
            ? new OrchestratorHubClient(_options.AppBaseUrl, tokenManager, hubLogger, hubUsername)
            : new OrchestratorHubClient(_options.AppBaseUrl, accessToken, hubLogger, hubUsername);

        hubClient.CommandReceived += (_, e) =>
        {
            if (e.Command == ExecutorCommand.Initiate)
            {
                // Queue the command; the main loop consumes it. Commands that arrive while a
                // job is executing or while the hub is reconnecting are preserved instead of
                // being written to a completed one-shot source and silently lost.
                _commandChannel.Writer.TryWrite(e);
            }
            else if (e.Command == ExecutorCommand.Abort || e.Command == ExecutorCommand.Killed)
            {
                _activeJobCts?.Cancel();
                _workerManager?.KillWorker();
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
        var lastTokenVersion = tokenManager?.Version ?? 0;
        while (!cancellationToken.IsCancellationRequested)
        {
            // If the hub is disconnected (including the case where the initial startup connect
            // failed) and no worker is running, try to reconnect now. This prevents the service
            // from appearing Offline in the frontend for hours while it is still draining jobs
            // via REST, because the only other reconnect trigger is the JWT refresh timer.
            if (hubClient.ConnectionState == HubConnectionState.Disconnected
                && _workerManager?.HasRunningWorker != true)
            {
                _logger.LogInformation("OrchestratorHub is disconnected; attempting to reconnect before polling for work.");
                DebugLog.Info("OrchestratorHub is disconnected; attempting to reconnect before polling for work.");
                try
                {
                    await ConnectHubWithRetryAsync(hubClient, cancellationToken);
                    _logger.LogInformation("Service is ONLINE — reconnected to OrchestratorHub.");
                    DebugLog.Info("Service is ONLINE — reconnected to OrchestratorHub.");
                }
                catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
                {
                    _logger.LogWarning(ex, "Failed to reconnect to OrchestratorHub before polling; will retry via REST job drain.");
                    DebugLog.Warn($"Failed to reconnect to OrchestratorHub before polling: {ex.Message}");
                }
            }

            // When the token manager refreshed the JWT (e.g. during the pending-job poll) and
            // no job is running, rebuild the hub connection so the handshake Authorization
            // header carries the new token. This must never happen mid-job: the backend kills
            // Running jobs when a machine reconnects to the hub.
            if (tokenManager is not null
                && tokenManager.Version != lastTokenVersion
                && _workerManager?.HasRunningWorker != true)
            {
                lastTokenVersion = tokenManager.Version;
                _logger.LogInformation("Machine JWT was refreshed; rebuilding the OrchestratorHub connection with the new token.");
                DebugLog.Info("Machine JWT was refreshed; rebuilding the OrchestratorHub connection.");
                try
                {
                    await ConnectHubWithRetryAsync(hubClient, cancellationToken);
                }
                catch (Exception ex) when (!cancellationToken.IsCancellationRequested)
                {
                    // A failed rebuild must not stop the service: ConnectAsync disposed the old
                    // connection, and the reconnect loop in WaitForCommandAsync rebuilds with a
                    // fresh handshake token on the next iteration.
                    _logger.LogWarning(ex, "Hub rebuild after JWT refresh failed; the reconnect loop will retry.");
                    DebugLog.Warn($"Hub rebuild after JWT refresh failed: {ex.Message}");
                }
            }

            // Wait up to 30s for a queued Initiate command; on timeout, fall through to the
            // pending-job drain so jobs created while offline (or whose SignalR push was
            // missed) are still picked up after the hub reconnects.
            ExecutorCommandReceivedEventArgs? command = null;
            using var commandWaitCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            commandWaitCts.CancelAfter(TimeSpan.FromSeconds(30));

            try
            {
                command = await _commandChannel.Reader.ReadAsync(commandWaitCts.Token);
            }
            catch (OperationCanceledException) when (commandWaitCts.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
            {
                // 30-second poll interval elapsed with no command; drain pending jobs below.
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                break;
            }

            if (command == null)
            {
                _logger.LogInformation("No job request received; polling for pending jobs.");
                await DrainPendingJobsAsync(backendClient, hubClient, machineId, accessToken, cancellationToken);
                continue;
            }

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

        var consecutiveFailures = 0;
        while (!cancellationToken.IsCancellationRequested)
        {
            Guid? nextJobId;
            try
            {
                nextJobId = await backendClient.GetNextPendingJobAsync(machineId, cancellationToken);
                consecutiveFailures = 0;
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex) when (IsTransientNetworkFailure(ex))
            {
                consecutiveFailures++;
                _logger.LogWarning(ex, "Transient failure querying next pending job for machine {MachineId} (attempt {Attempt}).", machineId, consecutiveFailures);
                DebugLog.Warn($"Transient failure querying next pending job for machine {machineId}: {ex.Message}");

                // Back off briefly so a backend/network blip does not spin tight.
                var delay = TimeSpan.FromSeconds(Math.Min(30, 5 * consecutiveFailures));
                try
                {
                    await Task.Delay(delay, cancellationToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                continue;
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

    private static bool IsTransientNetworkFailure(Exception ex)
    {
        return ex is HttpRequestException
            || ex is System.Net.Sockets.SocketException
            || ex is TimeoutException
            || (ex is IOException && ex.InnerException is System.Net.Sockets.SocketException);
    }

    // Refresh path for the token manager. Service mode re-registers with the tenant API key
    // (the key is installed with the service and never leaves this process); other modes
    // renew the still-valid machine JWT via machine-auth/validate, which needs no secret.
    private async Task<MachineRegistrationResult?> RefreshMachineTokenAsync(
        BackendHttpClient registerClient,
        string currentJwt,
        string registrationUsername,
        CancellationToken cancellationToken)
    {
        if (_options.IsServiceMode)
            return await RegisterMachineAsync(registerClient, registrationUsername, cancellationToken);

        return await registerClient.ValidateMachineAsync(
            currentJwt, MachineIdentity.OsId, registrationUsername, cancellationToken);
    }

    private async Task<MachineRegistrationResult?> RegisterMachineAsync(BackendHttpClient registerClient, string registrationUsername, CancellationToken cancellationToken)
    {
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
        var attempt = 0;
        while (!cancellationToken.IsCancellationRequested)
        {
            attempt++;
            try
            {
                _logger.LogInformation("Connecting to OrchestratorHub (attempt {Attempt})...", attempt);
                await hubClient.ConnectAsync(cancellationToken);
                return;
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to connect to OrchestratorHub (attempt {Attempt}).", attempt);
                DebugLog.Warn($"Failed to connect to OrchestratorHub (attempt {attempt}): {ex.Message}");

                // Exponential backoff capped at 60s. Retry indefinitely until cancellation so
                // the service stays alive through long outages and reconnects as soon as the
                // network/backend is back.
                var delay = TimeSpan.FromSeconds(Math.Min(60, Math.Pow(2, attempt - 1)));
                try
                {
                    await Task.Delay(delay, cancellationToken);
                }
                catch (OperationCanceledException)
                {
                    throw;
                }
            }
        }

        cancellationToken.ThrowIfCancellationRequested();
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
            // Hand the worker a freshly-checked token so jobs longer than the JWT lifetime
            // keep authenticating; the worker renews it itself via machine-auth/validate.
            var workerToken = _tokenManager is not null
                ? await _tokenManager.GetValidTokenAsync(cancellationToken)
                : accessToken;
            manager.StartWorker(targetJobId, _options.AppBaseUrl, workerToken, _registrationUsername);

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
