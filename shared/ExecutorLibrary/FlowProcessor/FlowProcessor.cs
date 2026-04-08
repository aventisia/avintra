using ExecutorLibrary.FlowProcessor.State;
using ExecutorLibrary.Helpers;

namespace ExecutorLibrary.FlowProcessor;

public class FlowProcessor
{
    private const int DefaultMaxExecutedNodeVisits = 10_000;
    private const int DefaultMaxLoopIterations = 1_000;
    private static readonly TimeSpan DefaultExecutionTimeout = TimeSpan.FromMinutes(10);

    private readonly INodeProcessor _nodeProcessor;
    private readonly int _maxExecutedNodeVisits;
    private readonly int _maxLoopIterations;
    private readonly TimeSpan _executionTimeout;

    public FlowProcessor(
        INodeProcessor nodeProcessor,
        int maxExecutedNodeVisits = DefaultMaxExecutedNodeVisits,
        int maxLoopIterations = DefaultMaxLoopIterations,
        TimeSpan? executionTimeout = null)
    {
        _nodeProcessor = nodeProcessor;
        _maxExecutedNodeVisits = maxExecutedNodeVisits;
        _maxLoopIterations = maxLoopIterations;
        _executionTimeout = executionTimeout ?? DefaultExecutionTimeout;
    }

    public async Task<FlowExecutionResult> ExecuteAsync(
        ReactFlowDataModel flow,
        CancellationToken cancellationToken = default)
    {
        var startTime = DateTimeOffset.UtcNow;
        Thread.Sleep(10000); // Simulate some initial delay for testing cancellation and timeout handling
        var flowExecutionContext = new FlowExecutionContext();
        var logs = new List<NodeExecutionLog>();
        var conditionalStates = new Dictionary<string, ConditionalBranchState>(StringComparer.OrdinalIgnoreCase);
        var loopStates = new Dictionary<string, LoopState>(StringComparer.OrdinalIgnoreCase);

        var validationError = FlowValidationHelper.IsValidFlowGraph(flow);
        if (!string.IsNullOrWhiteSpace(validationError))
        {
            return CreateFailedResult(startTime, logs, validationError);
        }

        // Set the start node as the current node
        var currentNodeId = flow.Nodes.FirstOrDefault(n => IsStartNodeType(n.Type))?.Id
            ?? throw new InvalidOperationException("Start node not found in the flow.");

        var executedNodeVisits = 0;

        try
        {
            // Loop until there are no more nodes to process
            while (!string.IsNullOrWhiteSpace(currentNodeId))
            {
                // Check for cancellation
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

                // Fetch the current node
                var node = flow.Nodes.FirstOrDefault(n => n.Id == currentNodeId);
                if (node is null) return CreateFailedResult(startTime, logs, $"Node not found: {currentNodeId}");

                // Process the current node and determine the next node to execute
                var nextNodeId = await ProcessNodeAndGetNextAsync(
                    node,
                    flow,
                    flowExecutionContext,
                    logs,
                    conditionalStates,
                    loopStates,
                    cancellationToken);

                // If no next node is available, execution is complete.
                if (nextNodeId is null)
                {
                    return CreateCompletedResult(startTime, logs);
                }

                currentNodeId = nextNodeId;
            }

            return CreateCompletedResult(startTime, logs);
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
        CancellationToken cancellationToken)
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
            case "branchNode1":
                return FindNextEdgeTarget(flow, node.Id);

            case "activityNode":
            case "aiNode":
            case "cloudConnectorNode":
                return await ProcessExecutableNodeAsync(node, flow, flowExecutionContext, logs, cancellationToken);

            case "flowEndNode":
                return null;

            case "conditionalNode":
                return ProcessConditionalNode(node, flow, conditionalStates);

            case "branchEndNode":
                return ProcessBranchEndNode(node, flow, conditionalStates, loopStates);

            case "forLoopNode":
                return ProcessForLoopNode(node, flow, loopStates);

            case "callAgentNode":
            case "blockNode":
                throw new NotSupportedException($"Node type '{node.Type}' is planned and will be added in the next implementation pass.");

            default:
                throw new InvalidOperationException($"Unknown node type: {node.Type}");
        }
    }

    private async Task<string?> ProcessExecutableNodeAsync(
        ReactFlowNodeModel node,
        ReactFlowDataModel flow,
        FlowExecutionContext flowExecutionContext,
        List<NodeExecutionLog> logs,
        CancellationToken cancellationToken)
    {
        var result = await _nodeProcessor.ExecuteAsync(node, flowExecutionContext, cancellationToken);

        if (result.NodeLog is not null)
        {
            logs.Add(result.NodeLog);
        }

        if (!result.IsSuccess)
        {
            throw new InvalidOperationException($"Node execution failed for node '{node.Id}'.");
        }

        foreach (var output in result.OutputValues)
        {
            flowExecutionContext.Set(output.Key, output.Value);
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
            var maxIterations = 5; // TODO: Default iteration count for testing, to be replaced with dynamic value
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

    private static FlowExecutionResult CreateCompletedResult(DateTimeOffset startTime, IReadOnlyList<NodeExecutionLog> logs)
    {
        return new FlowExecutionResult
        {
            IsSuccess = true,
            Status = FlowExecutionStatus.Completed,
            StartTime = startTime,
            EndTime = DateTimeOffset.UtcNow,
            NodeLogs = logs,
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
}
