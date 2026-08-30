namespace RunnerApp.Services;

public interface IExecutionEngine
{
    Task<FlowExecutionResult> ExecuteAsync(
        ExecutionGraphDto graph,
        CancellationToken cancellationToken = default,
        Action<string>? onNodeProgress = null,
        Action<NodeExecutionLog>? onNodeCompleted = null,
        Action<string, string>? onEdgeTraversed = null);
}
