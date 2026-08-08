using ExecutorLibrary.FlowProcessor.Models;

namespace RunnerApp.Services;

public interface IExecutionEngine
{
    Task<FlowExecutionResult> ExecuteAsync(ExecutionGraphDto graph, CancellationToken cancellationToken = default, Action<string>? onNodeProgress = null);
}
