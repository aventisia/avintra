using System.Diagnostics;

namespace RunnerApp.Services;

/// <summary>
/// Tracks a worker process spawned by the service. Exposes start, kill, and wait operations,
/// and translates the worker's exit code into a terminal job status.
/// </summary>
public sealed class WorkerProcessManager : IAsyncDisposable
{
    private readonly string _executablePath;
    private readonly bool _unattended;
    private Process? _workerProcess;
    private readonly object _lock = new();
    private bool _disposed;

    public WorkerProcessManager(string executablePath, bool unattended)
    {
        _executablePath = executablePath;
        _unattended = unattended;
    }

    public bool HasRunningWorker
    {
        get
        {
            lock (_lock)
            {
                return _workerProcess is { HasExited: false };
            }
        }
    }

    /// <summary>
    /// Starts the worker process for the given job.
    /// </summary>
    public Process StartWorker(Guid jobId, string appBaseUrl, string? machineJwt)
    {
        lock (_lock)
        {
            ObjectDisposedException.ThrowIf(_disposed, this);

            if (_workerProcess is { HasExited: false })
            {
                throw new InvalidOperationException("A worker process is already running.");
            }

            var options = new RunnerAppOptions
            {
                AppBaseUrl = appBaseUrl,
                JobId = jobId,
                IsWorkerMode = true,
                Launcher = "service",
                Unattended = _unattended,
            };

            DebugLog.Info($"WorkerProcessManager starting worker for job {jobId} (unattended={_unattended}).");
            _workerProcess = WorkerProcessLauncher.LaunchWorker(_executablePath, options, machineJwt);
            return _workerProcess;
        }
    }

    /// <summary>
    /// Requests the worker to abort by killing the process. The caller is still responsible
    /// for closing the job in the backend with an Aborted status.
    /// </summary>
    public void KillWorker()
    {
        lock (_lock)
        {
            if (_workerProcess is not { HasExited: false })
                return;

            try
            {
                DebugLog.Info($"Killing worker process {_workerProcess.Id} for abort/killed command.");
                _workerProcess.Kill(entireProcessTree: true);
            }
            catch (Exception ex)
            {
                DebugLog.Warn($"Failed to kill worker process: {ex.Message}");
            }
        }
    }

    /// <summary>
    /// Waits for the worker process to exit. Returns a suggested terminal job status based on
    /// the worker's exit code (0 = Completed, non-zero = Failed). The caller should override
    /// this with Aborted when a kill was requested.
    /// </summary>
    public async Task<WorkerExitResult> WaitForExitAsync(CancellationToken cancellationToken)
    {
        Process? process;
        lock (_lock)
        {
            process = _workerProcess;
        }

        if (process is null)
            return new WorkerExitResult(0, "Worker process was not started.", "No process");

        try
        {
            await process.WaitForExitAsync(cancellationToken);
        }
        catch (OperationCanceledException)
        {
            KillWorker();
            try
            {
                await process.WaitForExitAsync(CancellationToken.None);
            }
            catch
            {
                // Best effort.
            }
        }

        var exitCode = process.HasExited ? process.ExitCode : -1;
        var stdout = string.Empty;
        var stderr = string.Empty;

        try
        {
            stdout = await process.StandardOutput.ReadToEndAsync(cancellationToken);
            stderr = await process.StandardError.ReadToEndAsync(cancellationToken);
        }
        catch
        {
            // Best effort capture.
        }

        var status = exitCode == 0 ? "Completed" : "Failed";
        var summary = string.IsNullOrWhiteSpace(stderr)
            ? $"Worker exited with code {exitCode}."
            : $"Worker exited with code {exitCode}. stderr: {stderr.Trim()}";

        DebugLog.Info(summary);
        return new WorkerExitResult(exitCode, status, summary, stdout, stderr);
    }

    public async ValueTask DisposeAsync()
    {
        lock (_lock)
        {
            if (_disposed) return;
            _disposed = true;
        }

        KillWorker();
        if (_workerProcess is not null)
        {
            try
            {
                _workerProcess.Dispose();
            }
            catch
            {
                // Best effort.
            }
        }

        await Task.CompletedTask;
        GC.SuppressFinalize(this);
    }
}

/// <summary>
/// Outcome of a worker process exiting.
/// </summary>
public sealed record WorkerExitResult(
    int ExitCode,
    string SuggestedStatus,
    string Summary,
    string? StandardOutput = null,
    string? StandardError = null);
