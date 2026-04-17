namespace ExecutorLibrary.FlowProcessor.Interfaces;

public interface INodeProcessor
{
    Task<NodeExecutionResult> ExecuteAsync(
        ReactFlowNodeModel node,
        FlowExecutionContext context,
        CancellationToken cancellationToken = default);
}
