using System.Collections.Concurrent;
using ExecutorLibrary.FlowProcessor.Models;

namespace RunnerApp.Services;

/// <summary>
/// Periodically uploads node execution logs to the backend while a flow is running, so the
/// execution log survives a runner crash and the log view fills in as the job progresses.
/// The final CloseJobAsync still carries the complete log list; the backend deduplicates
/// by (NodeExecutionId, RetryAttempt), making the close upload a safety net rather than
/// the only copy.
/// </summary>
public sealed class NodeLogBatchFlusher : IAsyncDisposable
{
    private static readonly TimeSpan FlushInterval = TimeSpan.FromSeconds(30);
    private const int MaxLogsPerRequest = 500;

    private readonly Guid _jobId;
    private readonly IBackendClient _backendClient;
    private readonly Action<string> _log;
    private readonly ConcurrentQueue<NodeExecutionLog> _pending = new();
    private readonly CancellationTokenSource _cts = new();
    private readonly Task _flushLoop;

    public NodeLogBatchFlusher(Guid jobId, IBackendClient backendClient, Action<string>? log = null)
    {
        _jobId = jobId;
        _backendClient = backendClient;
        _log = log ?? (_ => { });
        _flushLoop = Task.Run(() => FlushLoopAsync(_cts.Token));
    }

    /// <summary>
    /// Queues a completed node log for the next periodic upload. Cheap and non-blocking;
    /// safe to call from the FlowProcessor completion callback.
    /// </summary>
    public void Enqueue(NodeExecutionLog log) => _pending.Enqueue(log);

    private async Task FlushLoopAsync(CancellationToken ct)
    {
        using var timer = new PeriodicTimer(FlushInterval);
        try
        {
            while (await timer.WaitForNextTickAsync(ct))
            {
                await FlushAsync(ct);
            }
        }
        catch (OperationCanceledException)
        {
            // Normal shutdown via StopAsync/DisposeAsync.
        }
        catch (Exception ex)
        {
            _log($"Node log flush loop stopped unexpectedly: {ex.Message}");
        }
    }

    private async Task FlushAsync(CancellationToken ct)
    {
        var batch = DrainBatch();
        if (batch.Count == 0)
        {
            return;
        }

        for (var offset = 0; offset < batch.Count; offset += MaxLogsPerRequest)
        {
            var chunk = batch.Skip(offset).Take(MaxLogsPerRequest).ToList();
            try
            {
                await _backendClient.InsertNodeExecutionLogsAsync(_jobId, chunk, ct);
                _log($"Flushed {chunk.Count} node execution logs for job {_jobId}.");
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // Re-queue the failed chunk for the next tick; the close-job upload is the
                // final safety net, so persistent failures here must not fail the run.
                foreach (var log in chunk)
                {
                    _pending.Enqueue(log);
                }

                _log($"Failed to flush {chunk.Count} node execution logs; will retry: {ex.Message}");
            }
        }
    }

    private List<NodeExecutionLog> DrainBatch()
    {
        var batch = new List<NodeExecutionLog>();
        while (_pending.TryDequeue(out var log))
        {
            batch.Add(log);
        }

        return batch;
    }

    /// <summary>
    /// Stops the periodic loop and uploads any remaining queued logs. Errors are swallowed:
    /// the close-job payload still contains every log, so a final-flush failure never
    /// affects the job outcome.
    /// </summary>
    public async Task StopAsync()
    {
        _cts.Cancel();
        try
        {
            await _flushLoop;
        }
        catch
        {
            // The loop logs its own unexpected failures.
        }

        await FlushAsync(CancellationToken.None);
    }

    public async ValueTask DisposeAsync()
    {
        try
        {
            await StopAsync();
        }
        catch
        {
            // Never throw from DisposeAsync.
        }

        _cts.Dispose();
    }
}