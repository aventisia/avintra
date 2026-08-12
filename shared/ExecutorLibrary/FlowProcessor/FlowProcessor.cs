using ExecutorLibrary.FlowProcessor.Helpers;
using ExecutorLibrary.FlowProcessor.State;
using ExecutorLibrary.Helpers;
using NodeLibrary.Models;

namespace ExecutorLibrary.FlowProcessor;

public class FlowProcessor
{
    private const int DefaultMaxExecutedNodeVisits = 10_000;
    private const int DefaultMaxLoopIterations = 1_000;
    private static readonly TimeSpan DefaultExecutionTimeout = TimeSpan.FromMinutes(10);

    private readonly INodeProcessor _nodeProcessor;
    private readonly IFlowGraphProvider? _flowGraphProvider;
    private readonly int _maxExecutedNodeVisits;
    private readonly int _maxLoopIterations;
    private readonly TimeSpan _executionTimeout;

    public FlowProcessor(
        INodeProcessor nodeProcessor,
        int maxExecutedNodeVisits = DefaultMaxExecutedNodeVisits,
        int maxLoopIterations = DefaultMaxLoopIterations,
        TimeSpan? executionTimeout = null)
        : this(nodeProcessor, null, maxExecutedNodeVisits, maxLoopIterations, executionTimeout)
    {
    }

    public FlowProcessor(
        INodeProcessor nodeProcessor,
        IFlowGraphProvider? flowGraphProvider,
        int maxExecutedNodeVisits = DefaultMaxExecutedNodeVisits,
        int maxLoopIterations = DefaultMaxLoopIterations,
        TimeSpan? executionTimeout = null)
    {
        _nodeProcessor = nodeProcessor;
        _flowGraphProvider = flowGraphProvider;
        _maxExecutedNodeVisits = maxExecutedNodeVisits;
        _maxLoopIterations = maxLoopIterations;
        _executionTimeout = executionTimeout ?? DefaultExecutionTimeout;
    }

    public async Task<FlowExecutionResult> ExecuteAsync(
        ReactFlowDataModel flow,
        Dictionary<string, object?>? initialVariables = null,
        CancellationToken cancellationToken = default,
        Action<string>? onNodeProgress = null,
        Action<NodeExecutionLog>? onNodeCompleted = null)
    {
        var startTime = DateTimeOffset.UtcNow;
        var flowExecutionContext = new FlowExecutionContext();

        if (initialVariables is not null)
        {
            foreach (var kvp in initialVariables)
            {
                flowExecutionContext.Set(kvp.Key, kvp.Value);
            }
        }
        var logs = new List<NodeExecutionLog>();
        var conditionalStates = new Dictionary<string, ConditionalBranchState>(StringComparer.OrdinalIgnoreCase);
        var loopStates = new Dictionary<string, LoopState>(StringComparer.OrdinalIgnoreCase);
        var executionStack = new Stack<FlowExecutionFrame>();

        var validationError = FlowValidationHelper.IsValidFlowGraph(flow);
        if (!string.IsNullOrWhiteSpace(validationError))
        {
            return CreateFailedResult(startTime, logs, validationError);
        }

        var currentNodeId = flow.Nodes.FirstOrDefault(n => IsStartNodeType(n.Type))?.Id
            ?? throw new InvalidOperationException("Start node not found in the flow.");

        var executedNodeVisits = 0;

        try
        {
            while (!string.IsNullOrWhiteSpace(currentNodeId))
            {
                cancellationToken.ThrowIfCancellationRequested();

                if (DateTimeOffset.UtcNow - startTime > _executionTimeout)
                {
                    throw new TimeoutException($"Flow execution exceeded timeout of {_executionTimeout.TotalSeconds} seconds.");
                }

                executedNodeVisits++;
                if (executedNodeVisits > _maxExecutedNodeVisits)
                {
                    throw new InvalidOperationException($"Flow execution exceeded maximum node visit limit of {_maxExecutedNodeVisits}.");
                }

                var node = flow.Nodes.FirstOrDefault(n => n.Id == currentNodeId);
                if (node is null) return CreateFailedResult(startTime, logs, $"Node not found: {currentNodeId}");

                onNodeProgress?.Invoke(node.Id);

                var nextNodeId = await ProcessNodeAndGetNextAsync(
                    node,
                    flow,
                    flowExecutionContext,
                    logs,
                    conditionalStates,
                    loopStates,
                    executionStack,
                    cancellationToken,
                    onNodeCompleted);

                if (nextNodeId is null)
                {
                    if (executionStack.Count > 0)
                    {
                        var frame = executionStack.Pop();
                        flow = frame.Flow;
                        conditionalStates = frame.ConditionalStates;
                        loopStates = frame.LoopStates;
                        currentNodeId = frame.ReturnNodeId;
                        continue;
                    }

                    return CreateCompletedResult(startTime, logs, flowExecutionContext);
                }

                currentNodeId = nextNodeId;
            }

            return CreateCompletedResult(startTime, logs, flowExecutionContext);
        }
        catch (OperationCanceledException)
        {
            return CreateAbortedResult(startTime, logs);
        }
        catch (Exception ex)
        {
            return CreateFailedResult(startTime, logs, ex.Message);
        }
    }

    private async Task<string?> ProcessNodeAndGetNextAsync(
        ReactFlowNodeModel node,
        ReactFlowDataModel flow,
        FlowExecutionContext flowExecutionContext,
        List<NodeExecutionLog> logs,
        Dictionary<string, ConditionalBranchState> conditionalStates,
        Dictionary<string, LoopState> loopStates,
        Stack<FlowExecutionFrame> executionStack,
        CancellationToken cancellationToken,
        Action<NodeExecutionLog>? onNodeCompleted = null)
    {
        if (node.Data?.IsDisabled == true)
        {
            return FindNextEdgeTarget(flow, node.Id);
        }

        switch (node.Type)
        {
            case "triggerNode":
            case "plusNode":
            case "mergeBranchesNode":
            case "branchStartNode":
                return FindNextEdgeTarget(flow, node.Id);

            case "branchNode1":
                return await ProcessBranchNode1Async(node, flow, flowExecutionContext, cancellationToken);

            case "activityNode":
            case "aiNode":
            case "cloudConnectorNode":
                return await ProcessExecutableNodeAsync(node, flow, flowExecutionContext, logs, cancellationToken, onNodeCompleted);

            case "flowEndNode":
                return null;

            case "conditionalNode":
                return ProcessConditionalNode(node, flow, conditionalStates);

            case "branchEndNode":
                return ProcessBranchEndNode(node, flow, flowExecutionContext, conditionalStates, loopStates);

            case "forLoopNode":
                return ProcessForLoopNode(node, flow, flowExecutionContext, loopStates);

            case "callAgentNode":
            case "blockNode":
                return await ProcessSubFlowNodeAsync(node, flow, flowExecutionContext, logs, conditionalStates, loopStates, executionStack, cancellationToken);

            default:
                throw new InvalidOperationException($"Unknown node type: {node.Type}");
        }
    }

    private Task<string?> ProcessBranchNode1Async(
        ReactFlowNodeModel node,
        ReactFlowDataModel flow,
        FlowExecutionContext flowExecutionContext,
        CancellationToken cancellationToken)
    {
        var conditionsInput = node.Data?.Inputs?.FirstOrDefault(i =>
            string.Equals(i.Key, "Conditions", StringComparison.OrdinalIgnoreCase));

        if (conditionsInput?.Value is null)
        {
            return Task.FromResult(FindNextEdgeTarget(flow, node.Id));
        }

        List<List<ResolvedConditionModel>>? conditionGroups = null;

        if (conditionsInput.Value is JsonElement jsonElement)
        {
            conditionGroups = JsonSerializer.Deserialize<List<List<ResolvedConditionModel>>>(jsonElement.GetRawText());
        }
        else if (conditionsInput.Value is List<List<ResolvedConditionModel>> typedGroups)
        {
            conditionGroups = typedGroups;
        }

        if (conditionGroups is null || conditionGroups.Count == 0)
        {
            return Task.FromResult(FindNextEdgeTarget(flow, node.Id));
        }

        var isTrue = ConditionEvaluator.Evaluate(conditionGroups);

        if (isTrue)
        {
            return Task.FromResult(FindNextEdgeTarget(flow, node.Id));
        }

        return Task.FromResult<string?>(null);
    }

    private async Task<string?> ProcessSubFlowNodeAsync(
        ReactFlowNodeModel node,
        ReactFlowDataModel flow,
        FlowExecutionContext flowExecutionContext,
        List<NodeExecutionLog> logs,
        Dictionary<string, ConditionalBranchState> conditionalStates,
        Dictionary<string, LoopState> loopStates,
        Stack<FlowExecutionFrame> executionStack,
        CancellationToken cancellationToken)
    {
        if (_flowGraphProvider is null)
        {
            throw new NotSupportedException($"Sub-flow node type '{node.Type}' requires an IFlowGraphProvider.");
        }

        var flowVersionIdStr = node.Type switch
        {
            "callAgentNode" => node.Data?.SelectedAgent,
            "blockNode" => node.Data?.SelectedBlock,
            _ => null
        };

        if (string.IsNullOrWhiteSpace(flowVersionIdStr))
        {
            throw new InvalidOperationException($"Sub-flow node '{node.Id}' is missing flow reference.");
        }

        var segments = flowVersionIdStr.Split(',');
        if (segments.Length < 1 || !Guid.TryParse(segments[0].Trim(), out var flowVersionId))
        {
            throw new InvalidOperationException($"Sub-flow node '{node.Id}' has invalid flow version id format: '{flowVersionIdStr}'.");
        }

        var subFlow = await _flowGraphProvider.GetFlowGraphAsync(flowVersionId, cancellationToken);
        if (subFlow is null)
        {
            throw new InvalidOperationException($"Sub-flow graph not found for flow version id '{flowVersionId}'.");
        }

        var frame = new FlowExecutionFrame
        {
            Flow = flow,
            ReturnNodeId = FindNextEdgeTarget(flow, node.Id) ?? string.Empty,
            ConditionalStates = conditionalStates,
            LoopStates = loopStates
        };
        executionStack.Push(frame);

        var subFlowTrigger = subFlow.Nodes.FirstOrDefault(n => IsStartNodeType(n.Type));
        if (subFlowTrigger is null)
        {
            throw new InvalidOperationException($"Sub-flow '{flowVersionId}' has no trigger node.");
        }

        return subFlowTrigger.Id;
    }

    private async Task<string?> ProcessExecutableNodeAsync(
        ReactFlowNodeModel node,
        ReactFlowDataModel flow,
        FlowExecutionContext flowExecutionContext,
        List<NodeExecutionLog> logs,
        CancellationToken cancellationToken,
        Action<NodeExecutionLog>? onNodeCompleted = null)
    {
        var result = await _nodeProcessor.ExecuteAsync(node, flowExecutionContext, cancellationToken);

        if (result.NodeLog is not null)
        {
            logs.Add(result.NodeLog);
        }

        // Report per-node completion immediately so consumers (e.g. the local WS progress
        // bus) can flip a node from running/spinner to success/failed as soon as it finishes,
        // rather than waiting for the entire flow to complete.
        if (result.NodeLog is not null)
        {
            onNodeCompleted?.Invoke(result.NodeLog);
        }

        if (!result.IsSuccess)
        {
            throw new InvalidOperationException($"Node execution failed for node '{node.Id}'.");
        }

        foreach (var output in result.OutputValues)
        {
            flowExecutionContext.Set(output.Key, output.Value);
        }

        if (string.Equals(node.Type, "aiNode", StringComparison.OrdinalIgnoreCase) &&
            flowExecutionContext.TryGet<string>("TriggeredBy", out var triggeredBy) &&
            string.Equals(triggeredBy, "chat", StringComparison.OrdinalIgnoreCase))
        {
            if (result.OutputValues.Values.FirstOrDefault() is { } firstOutput)
            {
                flowExecutionContext.Set("_ChatLLMResult", firstOutput);
            }
        }

        return FindNextEdgeTarget(flow, node.Id);
    }

    private static string? FindNextEdgeTarget(ReactFlowDataModel flow, string sourceNodeId)
    {
        var edge = flow.Edges.FirstOrDefault(e =>
            e.Source == sourceNodeId &&
            !string.Equals(e.Type, "loopBack", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(e.SourceHandle, "branch-return", StringComparison.OrdinalIgnoreCase));

        return edge?.Target;
    }

    private string? ProcessConditionalNode(
        ReactFlowNodeModel node,
        ReactFlowDataModel flow,
        Dictionary<string, ConditionalBranchState> conditionalStates)
    {
        if (!conditionalStates.TryGetValue(node.Id, out var state))
        {
            var mergeNodeId = node.Data.MergeBranchesNodeId;
            if (string.IsNullOrWhiteSpace(mergeNodeId))
            {
                throw new InvalidOperationException($"Conditional node '{node.Id}' is missing merge node id.");
            }

            var branches = ResolveConditionalBranches(node, flow, mergeNodeId);
            state = new ConditionalBranchState
            {
                Id = node.Id,
                MergeBranchesNodeId = mergeNodeId,
                RemainingBranches = new Queue<string>(branches)
            };
            conditionalStates[node.Id] = state;
        }

        if (state.RemainingBranches.Count == 0)
        {
            conditionalStates.Remove(node.Id);
            return state.MergeBranchesNodeId;
        }

        state.ExecutedBranchesCount++;
        return state.RemainingBranches.Dequeue();
    }

    private string? ProcessBranchEndNode(
        ReactFlowNodeModel node,
        ReactFlowDataModel flow,
        FlowExecutionContext flowExecutionContext,
        Dictionary<string, ConditionalBranchState> conditionalStates,
        Dictionary<string, LoopState> loopStates)
    {
        var parentNodeId = node.Data.CustomParentId;
        if (string.IsNullOrWhiteSpace(parentNodeId))
        {
            return FindNextEdgeTarget(flow, node.Id);
        }

        var parentNode = flow.Nodes.FirstOrDefault(n => n.Id == parentNodeId)
            ?? throw new InvalidOperationException($"Parent node '{parentNodeId}' not found for branch end node '{node.Id}'.");

        if (string.Equals(parentNode.Type, "conditionalNode", StringComparison.OrdinalIgnoreCase))
        {
            if (!conditionalStates.TryGetValue(parentNodeId, out var conditionalState))
            {
                throw new InvalidOperationException($"Conditional state was not found for node '{parentNodeId}'.");
            }

            if (conditionalState.RemainingBranches.Count > 0)
            {
                conditionalState.ExecutedBranchesCount++;
                return conditionalState.RemainingBranches.Dequeue();
            }

            conditionalStates.Remove(parentNodeId);
            return conditionalState.MergeBranchesNodeId;
        }

        if (string.Equals(parentNode.Type, "forLoopNode", StringComparison.OrdinalIgnoreCase))
        {
            if (!loopStates.TryGetValue(parentNodeId, out var loopState))
            {
                throw new InvalidOperationException($"Loop state was not found for node '{parentNodeId}'.");
            }

            if (string.Equals(loopState.LoopType, "ForEachLoop", StringComparison.OrdinalIgnoreCase))
            {
                loopState.CurrentIndex++;
                if (loopState.CurrentIndex < loopState.TotalCount)
                {
                    var listVar = loopState.ListVariableName;
                    if (!string.IsNullOrWhiteSpace(listVar) && flowExecutionContext.TryGet<object?>(listVar, out var listObj) && listObj is System.Collections.IEnumerable enumerable)
                    {
                        var index = 0;
                        foreach (var item in enumerable)
                        {
                            if (index == loopState.CurrentIndex)
                            {
                                if (!string.IsNullOrWhiteSpace(loopState.ItemVariableName))
                                    flowExecutionContext.Set(loopState.ItemVariableName, item);
                                if (!string.IsNullOrWhiteSpace(loopState.ItemIndexVariableName))
                                    flowExecutionContext.Set(loopState.ItemIndexVariableName, loopState.CurrentIndex);
                                break;
                            }
                            index++;
                        }
                    }
                    return loopState.LoopBodyStartNodeId;
                }

                loopStates.Remove(parentNodeId);
                return loopState.MergeBranchesNodeId;
            }

            loopState.CurrentIteration++;
            if (loopState.CurrentIteration > _maxLoopIterations)
            {
                throw new InvalidOperationException($"Loop node '{parentNodeId}' exceeded maximum allowed iterations of {_maxLoopIterations}.");
            }

            if (loopState.CurrentIteration < loopState.MaxIterations)
            {
                return loopState.LoopBodyStartNodeId;
            }

            loopStates.Remove(parentNodeId);
            return loopState.MergeBranchesNodeId;
        }

        return FindNextEdgeTarget(flow, node.Id);
    }

    private string ProcessForLoopNode(
        ReactFlowNodeModel node,
        ReactFlowDataModel flow,
        FlowExecutionContext flowExecutionContext,
        Dictionary<string, LoopState> loopStates)
    {
        if (!loopStates.TryGetValue(node.Id, out var loopState))
        {
            var mergeNodeId = node.Data.MergeBranchesNodeId;
            if (string.IsNullOrWhiteSpace(mergeNodeId))
            {
                throw new InvalidOperationException($"For loop node '{node.Id}' is missing merge node id.");
            }

            var bodyStartNodeId = ResolveLoopBodyStartNodeId(node, flow, mergeNodeId);

            var loopType = node.Data?.Inputs?.FirstOrDefault(i =>
                string.Equals(i.Key, "LoopType", StringComparison.OrdinalIgnoreCase))?.Value?.ToString() ?? "for";

            if (string.Equals(loopType, "ForEachLoop", StringComparison.OrdinalIgnoreCase))
            {
                var listVarName = node.Data?.Inputs?.FirstOrDefault(i =>
                    string.Equals(i.Key, "ListVariableName", StringComparison.OrdinalIgnoreCase))?.Value?.ToString() ?? string.Empty;

                var itemVarName = node.Data?.Inputs?.FirstOrDefault(i =>
                    string.Equals(i.Key, "ItemVariableName", StringComparison.OrdinalIgnoreCase))?.Value?.ToString() ?? string.Empty;

                var indexVarName = node.Data?.Inputs?.FirstOrDefault(i =>
                    string.Equals(i.Key, "ItemIndexVariableName", StringComparison.OrdinalIgnoreCase))?.Value?.ToString() ?? string.Empty;

                var totalCount = 0;
                if (!string.IsNullOrWhiteSpace(listVarName) && flowExecutionContext.TryGet<object?>(listVarName, out var listObj) && listObj is System.Collections.IEnumerable enumerable)
                {
                    var list = enumerable.Cast<object?>().ToList();
                    totalCount = list.Count;

                    if (totalCount > 0)
                    {
                        if (!string.IsNullOrWhiteSpace(itemVarName))
                            flowExecutionContext.Set(itemVarName, list[0]);
                        if (!string.IsNullOrWhiteSpace(indexVarName))
                            flowExecutionContext.Set(indexVarName, 0);
                    }
                }

                loopState = new LoopState
                {
                    Id = node.Id,
                    LoopType = "ForEachLoop",
                    MergeBranchesNodeId = mergeNodeId,
                    LoopBodyStartNodeId = bodyStartNodeId,
                    MaxIterations = totalCount,
                    CurrentIteration = 0,
                    CurrentIndex = 0,
                    TotalCount = totalCount,
                    ListVariableName = listVarName,
                    ItemVariableName = itemVarName,
                    ItemIndexVariableName = indexVarName
                };
            }
            else
            {
                var maxIterations = 5;
                if (maxIterations < 0)
                {
                    throw new InvalidOperationException($"For loop node '{node.Id}' has invalid negative iteration count.");
                }

                if (maxIterations > _maxLoopIterations)
                {
                    throw new InvalidOperationException($"For loop node '{node.Id}' exceeds maximum configured loop iteration cap of {_maxLoopIterations}.");
                }

                loopState = new LoopState
                {
                    Id = node.Id,
                    LoopType = "for",
                    MergeBranchesNodeId = mergeNodeId,
                    LoopBodyStartNodeId = bodyStartNodeId,
                    MaxIterations = maxIterations,
                    CurrentIteration = 0
                };
            }

            loopStates[node.Id] = loopState;
        }

        if (loopState.MaxIterations == 0)
        {
            loopStates.Remove(node.Id);
            return loopState.MergeBranchesNodeId;
        }

        return loopState.LoopBodyStartNodeId;
    }

    private static IReadOnlyList<string> ResolveConditionalBranches(
        ReactFlowNodeModel conditionalNode,
        ReactFlowDataModel flow,
        string mergeNodeId)
    {
        var branchesFromNodeData = conditionalNode.Data.Branches
            ?.Where(b => !string.IsNullOrWhiteSpace(b) && !string.Equals(b, mergeNodeId, StringComparison.OrdinalIgnoreCase))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (branchesFromNodeData is { Count: > 0 })
        {
            return branchesFromNodeData;
        }

        return flow.Edges
            .Where(e => e.Source == conditionalNode.Id && !string.Equals(e.Target, mergeNodeId, StringComparison.OrdinalIgnoreCase))
            .Select(e => e.Target)
            .Where(target => !string.IsNullOrWhiteSpace(target))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    private static string ResolveLoopBodyStartNodeId(
        ReactFlowNodeModel loopNode,
        ReactFlowDataModel flow,
        string mergeNodeId)
    {
        var edge = flow.Edges.FirstOrDefault(e =>
            e.Source == loopNode.Id &&
            !string.Equals(e.Target, mergeNodeId, StringComparison.OrdinalIgnoreCase));

        if (string.IsNullOrWhiteSpace(edge?.Target))
        {
            throw new InvalidOperationException($"For loop node '{loopNode.Id}' does not have a loop body entry edge.");
        }

        return edge.Target;
    }

    private static bool IsStartNodeType(string? nodeType)
    {
        return string.Equals(nodeType, "startNode", StringComparison.OrdinalIgnoreCase)
            || string.Equals(nodeType, "triggerNode", StringComparison.OrdinalIgnoreCase);
    }

    private static readonly HashSet<string> ExcludedOutputVariables = new(StringComparer.OrdinalIgnoreCase)
    {
        "_agent", "_caller", "_job",
    };

    private static FlowExecutionResult CreateCompletedResult(DateTimeOffset startTime, IReadOnlyList<NodeExecutionLog> logs, FlowExecutionContext? context = null)
    {
        return new FlowExecutionResult
        {
            IsSuccess = true,
            Status = FlowExecutionStatus.Completed,
            StartTime = startTime,
            EndTime = DateTimeOffset.UtcNow,
            NodeLogs = logs,
            OutputVariables = SnapshotOutputVariables(context),
        };
    }

    private static FlowExecutionResult CreateAbortedResult(DateTimeOffset startTime, IReadOnlyList<NodeExecutionLog> logs)
    {
        return new FlowExecutionResult
        {
            IsSuccess = false,
            Status = FlowExecutionStatus.Aborted,
            StartTime = startTime,
            EndTime = DateTimeOffset.UtcNow,
            NodeLogs = logs,
        };
    }

    private static FlowExecutionResult CreateFailedResult(DateTimeOffset startTime, IReadOnlyList<NodeExecutionLog> logs, string errorMessage)
    {
        return new FlowExecutionResult
        {
            IsSuccess = false,
            Status = FlowExecutionStatus.Failed,
            StartTime = startTime,
            EndTime = DateTimeOffset.UtcNow,
            NodeLogs = logs,
            ErrorMessage = errorMessage,
        };
    }

    private static Dictionary<string, object?>? SnapshotOutputVariables(FlowExecutionContext? context)
    {
        if (context is null)
            return null;

        var snapshot = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);
        foreach (var kvp in context.Variables)
        {
            if (ExcludedOutputVariables.Contains(kvp.Key))
                continue;

            snapshot[kvp.Key] = kvp.Value;
        }

        return snapshot.Count > 0 ? snapshot : null;
    }
}
