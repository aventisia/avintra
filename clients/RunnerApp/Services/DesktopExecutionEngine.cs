using System.Text.Json.Nodes;
using ExecutorLibrary.FlowProcessor;
using ExecutorLibrary.FlowProcessor.Models;
using ExecutorLibrary.Helpers;
using ExecutorLibrary.Models;
using NodeLibrary.Core;

namespace RunnerApp.Services;

public class DesktopExecutionEngine : IExecutionEngine
{
    private readonly string _accessToken;

    public DesktopExecutionEngine(string accessToken)
    {
        _accessToken = accessToken;
    }

    public async Task<FlowExecutionResult> ExecuteAsync(ExecutionGraphDto graph, CancellationToken ct = default, Action<string>? onNodeProgress = null)
    {
        var flow = ReactFlowHelper.Parse(graph.ReactFlowObject)
            ?? throw new InvalidOperationException("Failed to parse parent flow graph.");

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
                AccessToken = _accessToken
            },
            ["_job"] = new JobContext
            {
                Id = graph.JobId,
                InputArguments = ParseInputArguments(graph.InputArgumentsJson)
            }
        };

        var processor = new FlowProcessor(new NodeProcessor(), flowGraphProvider: provider);
        return await processor.ExecuteAsync(flow, initialVariables, ct, onNodeProgress);
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
