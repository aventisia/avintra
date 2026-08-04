namespace ExecutorLibrary.FlowProcessor.Interfaces;

public interface IFlowGraphProvider
{
    Task<ReactFlowDataModel?> GetFlowGraphAsync(Guid flowVersionId, CancellationToken cancellationToken = default);
}
