using System.Collections.Concurrent;
using System.Runtime.ExceptionServices;
using System.Text.Json.Nodes;
using ExecutorLibrary.FlowProcessor;
using NodeLibrary.Core;

namespace RunnerApp.Services;

public class DesktopExecutionEngine : IExecutionEngine
{
    private readonly string _accessToken;
    private readonly string _appBaseUrl;

    public DesktopExecutionEngine(string accessToken, string appBaseUrl)
    {
        _accessToken = accessToken;
        _appBaseUrl = appBaseUrl;
    }

    public async Task<FlowExecutionResult> ExecuteAsync(
        ExecutionGraphDto graph,
        CancellationToken ct = default,
        Action<string>? onNodeProgress = null,
        Action<NodeExecutionLog>? onNodeCompleted = null,
        Action<string, string>? onEdgeTraversed = null)
    {
        var flow = ReactFlowHelper.Parse(graph.ReactFlowObject)
            ?? throw new InvalidOperationException("Failed to parse parent flow graph.");

        // Attach the flow's declared input/output schema to the top-level graph so the
        // processor can seed the trigger's declared inputs (with their defaults) as
        // top-level context variables, mirroring the legacy NodeExecutor behavior.
        flow.InputOutputObject = graph.InputOutputObject;

        var provider = new BackendFlowGraphProvider(graph);

        var initialVariables = new Dictionary<string, object?>
        {
            ["_agent"] = new FlowMetadata
            {
                Id = graph.FlowVersionId,
                Name = graph.FlowName
            },
            ["_caller"] = new CallerContext
            {
                TenantId = graph.TenantId,
                AccessToken = _accessToken,
                AppBaseUrl = _appBaseUrl
            },
            ["_job"] = new JobContext
            {
                Id = graph.JobId,
                InputArguments = ParseInputArguments(graph.InputArgumentsJson)
            }
        };

        var processor = new FlowProcessor(new NodeProcessor(), flowGraphProvider: provider);

        // Run the entire flow on a single persistent STA thread. Office/COM automation nodes
        // (e.g. Excel) create COM objects on an STA thread and return them as outputs. If the
        // creating thread exits before a downstream node uses the object, the RCW is separated
        // from its apartment and later access throws "COM object that has been separated from
        // its underlying RCW". Hosting the whole flow on one STA thread keeps all COM objects
        // in the same apartment for their full lifetime.
        return await RunOnStaThreadAsync(
            () => processor.ExecuteAsync(flow, initialVariables, ct, onNodeProgress, onNodeCompleted, onEdgeTraversed));
    }

    private static Task<T> RunOnStaThreadAsync<T>(Func<Task<T>> work)
    {
        var tcs = new TaskCompletionSource<T>(TaskCreationOptions.RunContinuationsAsynchronously);
        var staThread = new Thread(() =>
        {
            var syncContext = new StaSynchronizationContext();
            SynchronizationContext.SetSynchronizationContext(syncContext);

            try
            {
                work().ContinueWith(t =>
                {
                    if (t.IsFaulted && t.Exception is not null)
                        tcs.TrySetException(t.Exception.InnerException ?? t.Exception);
                    else if (t.IsCanceled)
                        tcs.TrySetCanceled();
                    else
                        tcs.TrySetResult(t.Result);

                    // Stop pumping once the flow has completed so the STA thread can exit.
                    syncContext.Stop();
                }, TaskScheduler.Default);
            }
            catch (Exception ex)
            {
                tcs.TrySetException(ex);
                syncContext.Stop();
                return;
            }

            // Pump the synchronization context so awaited continuations run on this STA thread.
            syncContext.Run();
        })
        {
            IsBackground = true,
            Name = "FlowExecution-STA"
        };
        staThread.SetApartmentState(ApartmentState.STA);
        staThread.Start();

        return tcs.Task;
    }

    /// <summary>
    /// A single-threaded SynchronizationContext used to keep the entire flow — including the
    /// internal awaits in FlowProcessor — executing on the persistent STA thread. This mirrors
    /// how a Windows message loop (e.g. WPF/WinForms) keeps continuations on the UI thread.
    /// </summary>
    private sealed class StaSynchronizationContext : SynchronizationContext
    {
        private readonly ConcurrentQueue<(SendOrPostCallback Callback, object? State)> _queue = new();
        private readonly AutoResetEvent _signal = new(false);
        private int _isRunning;

        public void Run()
        {
            Interlocked.Exchange(ref _isRunning, 1);
            while (Volatile.Read(ref _isRunning) == 1)
            {
                if (!_queue.TryDequeue(out var item))
                {
                    // Wait for the next posted continuation, or exit once the work has completed.
                    _signal.WaitOne();
                    continue;
                }

                item.Callback(item.State);
            }
        }

        public override void Post(SendOrPostCallback d, object? state)
        {
            _queue.Enqueue((d, state));
            _signal.Set();
        }

        public override void Send(SendOrPostCallback d, object? state)
        {
            if (ReferenceEquals(SynchronizationContext.Current, this))
            {
                d(state);
                return;
            }

            var completed = new ManualResetEventSlim();
            Exception? captured = null;
            SendOrPostCallback callback = _ =>
            {
                try
                {
                    d(state);
                }
                catch (Exception ex)
                {
                    captured = ex;
                }
                finally
                {
                    completed.Set();
                }
            };
            _queue.Enqueue((callback, state));
            _signal.Set();
            completed.Wait();
            if (captured is not null)
                ExceptionDispatchInfo.Capture(captured).Throw();
        }

        public void Stop()
        {
            Interlocked.Exchange(ref _isRunning, 0);
            _signal.Set();
        }
    }

    private static JsonNode? ParseInputArguments(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return null;

        try
        {
            return JsonNode.Parse(json);
        }
        catch
        {
            return null;
        }
    }
}
