using ExecutorLibrary.FlowProcessor.Interfaces;

namespace RunnerApp.Services;

public class BackendFlowGraphProvider : IFlowGraphProvider
{
    private readonly Dictionary<Guid, ReactFlowDataModel> _cache = new();

    public BackendFlowGraphProvider(ExecutionGraphDto upfrontGraph)
    {
        CacheGraph(upfrontGraph);
    }

    private void CacheGraph(ExecutionGraphDto graph)
    {
        var parsed = ReactFlowHelper.Parse(graph.ReactFlowObject);
        if (parsed is not null)
        {
            parsed.InputOutputObject = graph.InputOutputObject;
            _cache[graph.FlowVersionId] = parsed;
        }

        foreach (var subFlow in graph.SubFlows)
        {
            var subParsed = ReactFlowHelper.Parse(subFlow.ReactFlowObject);
            if (subParsed is not null)
            {
                subParsed.InputOutputObject = subFlow.InputOutputObject;
                _cache[subFlow.FlowVersionId] = subParsed;
            }
        }
    }

    public Task<ReactFlowDataModel?> GetFlowGraphAsync(Guid flowVersionId, CancellationToken ct = default)
    {
        _cache.TryGetValue(flowVersionId, out var model);
        return Task.FromResult(model);
    }
}
