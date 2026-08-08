using ExecutorLibrary.FlowProcessor.Interfaces;
using ExecutorLibrary.Helpers;
using ExecutorLibrary.Models;

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
            _cache[graph.FlowVersionId] = parsed;

        foreach (var subFlow in graph.SubFlows)
        {
            var subParsed = ReactFlowHelper.Parse(subFlow.ReactFlowObject);
            if (subParsed is not null)
                _cache[subFlow.FlowVersionId] = subParsed;
        }
    }

    public Task<ReactFlowDataModel?> GetFlowGraphAsync(Guid flowVersionId, CancellationToken ct = default)
    {
        _cache.TryGetValue(flowVersionId, out var model);
        return Task.FromResult(model);
    }
}
