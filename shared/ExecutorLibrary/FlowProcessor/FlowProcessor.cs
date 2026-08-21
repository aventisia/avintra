using ExecutorLibrary.FlowProcessor.Helpers;
using ExecutorLibrary.FlowProcessor.State;
using ExecutorLibrary.Helpers;
using NodeLibrary.Models;
using System.Data;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace ExecutorLibrary.FlowProcessor;

public class FlowProcessor
{
    private const int DefaultMaxExecutedNodeVisits = 10_000;
    private const int DefaultMaxLoopIterations = 1_000;
    private const int DefaultMaxNodeExecutionLogs = 1_000;
    private static readonly TimeSpan DefaultExecutionTimeout = TimeSpan.FromMinutes(10);

    private readonly INodeProcessor _nodeProcessor;
    private readonly IFlowGraphProvider? _flowGraphProvider;
    private readonly int _maxExecutedNodeVisits;
    private readonly int _maxLoopIterations;
    private readonly int _maxNodeExecutionLogs;
    private readonly TimeSpan _executionTimeout;

    public FlowProcessor(
        INodeProcessor nodeProcessor,
        int maxExecutedNodeVisits = DefaultMaxExecutedNodeVisits,
        int maxLoopIterations = DefaultMaxLoopIterations,
        int maxNodeExecutionLogs = DefaultMaxNodeExecutionLogs,
        TimeSpan? executionTimeout = null)
        : this(nodeProcessor, null, maxExecutedNodeVisits, maxLoopIterations, maxNodeExecutionLogs, executionTimeout)
    {
    }

    public FlowProcessor(
        INodeProcessor nodeProcessor,
        IFlowGraphProvider? flowGraphProvider,
        int maxExecutedNodeVisits = DefaultMaxExecutedNodeVisits,
        int maxLoopIterations = DefaultMaxLoopIterations,
        int maxNodeExecutionLogs = DefaultMaxNodeExecutionLogs,
        TimeSpan? executionTimeout = null)
    {
        _nodeProcessor = nodeProcessor;
        _flowGraphProvider = flowGraphProvider;
        _maxExecutedNodeVisits = maxExecutedNodeVisits;
        _maxLoopIterations = maxLoopIterations;
        _maxNodeExecutionLogs = maxNodeExecutionLogs;
        _executionTimeout = executionTimeout ?? DefaultExecutionTimeout;
    }

    public async Task<FlowExecutionResult> ExecuteAsync(
        ReactFlowDataModel flow,
        Dictionary<string, object?>? initialVariables = null,
        CancellationToken cancellationToken = default,
        Action<string>? onNodeProgress = null,
        Action<NodeExecutionLog>? onNodeCompleted = null,
        Action<string, string>? onEdgeTraversed = null)
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

        // Seed the top-level flow's declared trigger inputs with their default values,
        // mirroring the sub-flow input seeding logic. This restores the legacy NodeExecutor
        // behavior where a flow input such as "var1" (default 150) was available as a live
        // context variable. Explicitly-provided initial variables win over defaults.
        foreach (var declaredInput in ParseTriggerInputs(flow.InputOutputObject))
        {
            if (flowExecutionContext.TryGet(declaredInput.Name, out _))
            {
                continue;
            }

            if (declaredInput.DefaultValue is not null)
            {
                flowExecutionContext.Set(declaredInput.Name, flowExecutionContext.ResolveTemplateObject(declaredInput.DefaultValue));
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

                var (edgeId, nextNodeId) = await ProcessNodeAndGetNextEdgeAsync(
                    node,
                    flow,
                    flowExecutionContext,
                    logs,
                    conditionalStates,
                    loopStates,
                    executionStack,
                    cancellationToken,
                    onNodeCompleted);

                if (!string.IsNullOrWhiteSpace(edgeId) && !string.IsNullOrWhiteSpace(nextNodeId))
                {
                    onEdgeTraversed?.Invoke(edgeId, nextNodeId);
                }

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

    private async Task<(string? EdgeId, string? NextNodeId)> ProcessNodeAndGetNextEdgeAsync(
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
            var disabledEdge = FindNextEdge(flow, node.Id);
            return (disabledEdge?.Id, disabledEdge?.Target);
        }

        switch (node.Type)
        {
            case "triggerNode":
            case "plusNode":
            case "mergeBranchesNode":
            case "branchStartNode":
                var supportEdge = FindNextEdge(flow, node.Id);
                CompleteSupportNode(node, logs, onNodeCompleted);
                return (supportEdge?.Id, supportEdge?.Target);

            case "branchNode1":
                var (branchNext, branchLog) = await ProcessBranchNode1Async(node, flow, flowExecutionContext, cancellationToken);
                var branchEdge = FindNextEdge(flow, node.Id, branchNext);
                CompleteSupportNode(node, logs, onNodeCompleted, branchLog);
                return (branchEdge?.Id, branchNext);

            case "activityNode":
            case "aiNode":
            case "cloudConnectorNode":
                var execNext = await ProcessExecutableNodeAsync(node, flow, flowExecutionContext, logs, cancellationToken, onNodeCompleted);
                var execEdge = string.IsNullOrWhiteSpace(execNext) ? null : FindNextEdge(flow, node.Id, execNext);
                return (execEdge?.Id, execNext);

            case "flowEndNode":
                // End node is visual/terminator only: signal completion without logging
                // a per-node entry so the last meaningful executed node remains visible.
                return (null, null);

            case "conditionalNode":
                var (conditionalNext, routerLog) = ProcessConditionalNode(node, flow, flowExecutionContext, conditionalStates);
                var conditionalEdge = string.IsNullOrWhiteSpace(conditionalNext) ? null : FindNextEdge(flow, node.Id, conditionalNext);
                CompleteSupportNode(node, logs, onNodeCompleted, routerLog);
                return (conditionalEdge?.Id, conditionalNext);

            case "branchEndNode":
                var branchEndNext = ProcessBranchEndNode(node, flow, flowExecutionContext, conditionalStates, loopStates);
                var branchEndEdge = string.IsNullOrWhiteSpace(branchEndNext) ? null : FindNextEdge(flow, node.Id, branchEndNext);
                CompleteSupportNode(node, logs, onNodeCompleted);
                return (branchEndEdge?.Id, branchEndNext);

            case "forLoopNode":
                var loopNext = ProcessForLoopNode(node, flow, flowExecutionContext, loopStates);
                var loopEdge = string.IsNullOrWhiteSpace(loopNext) ? null : FindNextEdge(flow, node.Id, loopNext);
                CompleteSupportNode(node, logs, onNodeCompleted);
                return (loopEdge?.Id, loopNext);

            case "callAgentNode":
            case "blockNode":
                var subFlowNext = await ProcessSubFlowNodeAsync(node, flow, flowExecutionContext, logs, conditionalStates, loopStates, executionStack, cancellationToken);
                var subFlowEdge = string.IsNullOrWhiteSpace(subFlowNext) ? null : FindNextEdge(flow, node.Id, subFlowNext);
                return (subFlowEdge?.Id, subFlowNext);

            default:
                throw new InvalidOperationException($"Unknown node type: {node.Type}");
        }
    }

    /// <summary>
    /// Finds the outgoing edge from <paramref name="sourceNodeId"/> to <paramref name="targetNodeId"/>.
    /// If <paramref name="targetNodeId"/> is null, returns the first eligible outgoing edge.
    /// Excludes loop-back edges and branch-return edges.
    /// </summary>
    private static ReactFlowEdgeModel? FindNextEdge(
        ReactFlowDataModel flow,
        string sourceNodeId,
        string? targetNodeId = null)
    {
        return flow.Edges.FirstOrDefault(e =>
            e.Source == sourceNodeId &&
            !string.Equals(e.Type, "loopBack", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(e.SourceHandle, "branch-return", StringComparison.OrdinalIgnoreCase) &&
            (targetNodeId == null || e.Target == targetNodeId));
    }

    private static string? FindNextEdgeTarget(ReactFlowDataModel flow, string sourceNodeId)
    {
        return FindNextEdge(flow, sourceNodeId)?.Target;
    }

    /// <summary>
    /// Marks a non-executable (support) node as completed so consumers such as the local
    /// WebSocket progress bus can flip the node from running/spinner to success. The log
    /// is also added to the execution log list so it is included in the final job payload.
    /// </summary>
    private static void CompleteSupportNode(
        ReactFlowNodeModel node,
        List<NodeExecutionLog> logs,
        Action<NodeExecutionLog>? onNodeCompleted = null,
        NodeExecutionLog? resultLog = null)
    {
        var log = resultLog ?? new NodeExecutionLog
        {
            NodeId = node.Id,
            NodeName = string.IsNullOrWhiteSpace(node.Data?.Label) ? node.Type : node.Data.Label,
            NodeUniqueName = node.Data?.Name ?? node.Type,
            IsSuccess = true,
            Duration = 0,
            Inputs = node.Data?.Inputs?.ToDictionary(i => i.Key, i => i.Value?.ToString() ?? string.Empty, StringComparer.OrdinalIgnoreCase)
                ?? new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase),
            Outputs = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        };

        // Ensure the log is stamped with the node's identity even when a caller provides a result log.
        log.NodeId = node.Id;
        log.NodeName = string.IsNullOrWhiteSpace(node.Data?.Label) ? node.Type : node.Data.Label;
        log.NodeUniqueName = node.Data?.Name ?? node.Type;

        logs.EnqueueBounded(log, DefaultMaxNodeExecutionLogs);
        onNodeCompleted?.Invoke(log);
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

        var selectedSubFlow = node.Type switch
        {
            "callAgentNode" => node.Data?.SelectedAgent,
            "blockNode" => node.Data?.SelectedBlock,
            _ => null
        };

        var flowVersionIdStr = selectedSubFlow?.ValueKind == JsonValueKind.Object
            ? GetJsonStringProperty(selectedSubFlow.Value, "id")
            : selectedSubFlow?.ToString();

        if (!TryParseFlowVersionId(flowVersionIdStr, out var flowVersionId))
        {
            throw new InvalidOperationException($"Sub-flow node '{node.Id}' has invalid flow version id format: '{flowVersionIdStr}'.");
        }

        var subFlow = await _flowGraphProvider.GetFlowGraphAsync(flowVersionId, cancellationToken);
        if (subFlow is null)
        {
            throw new InvalidOperationException($"Sub-flow graph not found for flow version id '{flowVersionId}'.");
        }

        var subFlowTrigger = subFlow.Nodes.FirstOrDefault(n => IsStartNodeType(n.Type));
        if (subFlowTrigger is null)
        {
            throw new InvalidOperationException($"Sub-flow '{flowVersionId}' has no trigger node.");
        }

        // Map caller-node inputs into the sub-flow execution context. We first seed the
        // trigger's declared inputs with their default values, then apply caller-provided
        // overrides. Any declared input that is required and has neither a default nor a
        // caller value fails the node with a clear message.
        var declaredTriggerInputs = ParseTriggerInputs(subFlow.InputOutputObject);
        var callerInputMap = node.Data?.Inputs
            ?.Where(i => !string.IsNullOrWhiteSpace(i.Key) && !i.Key.StartsWith('_'))
            .ToDictionary(i => i.Key, i => i.Value, StringComparer.OrdinalIgnoreCase)
            ?? new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);

        foreach (var declaredInput in declaredTriggerInputs)
        {
            var key = declaredInput.Name;

            if (callerInputMap.TryGetValue(key, out var callerValue) && callerValue is not null)
            {
                var resolvedValue = flowExecutionContext.ResolveTemplateObject(callerValue);
                flowExecutionContext.Set(key, resolvedValue);
                continue;
            }

            if (declaredInput.DefaultValue is not null)
            {
                var resolvedDefault = flowExecutionContext.ResolveTemplateObject(declaredInput.DefaultValue);
                flowExecutionContext.Set(key, resolvedDefault);
                continue;
            }

            if (declaredInput.Required)
            {
                throw new InvalidOperationException(
                    $"Sub-flow trigger input '{key}' is required but was not provided by caller node '{node.Id}'.");
            }
        }

        // Also apply any caller inputs that are not declared on the trigger, so ad-hoc
        // context variables passed by the caller are still available inside the sub-flow.
        foreach (var callerInput in callerInputMap)
        {
            if (declaredTriggerInputs.Any(i => string.Equals(i.Name, callerInput.Key, StringComparison.OrdinalIgnoreCase)))
            {
                continue;
            }

            var resolvedValue = flowExecutionContext.ResolveTemplateObject(callerInput.Value);
            flowExecutionContext.Set(callerInput.Key, resolvedValue);
        }

        var frame = new FlowExecutionFrame
        {
            Flow = flow,
            ReturnNodeId = FindNextEdgeTarget(flow, node.Id) ?? string.Empty,
            ConditionalStates = conditionalStates,
            LoopStates = loopStates
        };
        executionStack.Push(frame);

        return subFlowTrigger.Id;
    }

    private static bool TryParseFlowVersionId(string? raw, out Guid flowVersionId)
    {
        flowVersionId = Guid.Empty;

        if (string.IsNullOrWhiteSpace(raw))
        {
            return false;
        }

        var trimmed = raw.Trim();

        // Legacy format stored by the backend normalization: "flowId,flowVersionId"
        var segments = trimmed.Split(',');
        if (segments.Length >= 1 && Guid.TryParse(segments[0].Trim(), out var legacyId))
        {
            flowVersionId = legacyId;
            return true;
        }

        return false;
    }

    private static string? GetJsonStringProperty(JsonElement element, string propertyName)
    {
        if (element.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String)
        {
            return property.GetString();
        }

        return null;
    }

    private static readonly JsonSerializerOptions s_caseInsensitiveConditionOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase, allowIntegerValues: true) }
    };

    private Task<(string? NextNodeId, NodeExecutionLog Log)> ProcessBranchNode1Async(
        ReactFlowNodeModel node,
        ReactFlowDataModel flow,
        FlowExecutionContext flowExecutionContext,
        CancellationToken cancellationToken)
    {
        var conditionsInput = node.Data?.Inputs?.FirstOrDefault(i =>
            string.Equals(i.Key, "Conditions", StringComparison.OrdinalIgnoreCase));

        if (conditionsInput?.Value is null)
        {
            var passthroughLog = CreateBranchLog(node, null, null);
            return Task.FromResult((FindNextEdgeTarget(flow, node.Id), passthroughLog));
        }

        List<List<ResolvedConditionModel>>? conditionGroups = null;
        string? rawConditionsJson = null;

        if (conditionsInput.Value is JsonElement jsonElement)
        {
            rawConditionsJson = jsonElement.GetRawText();
            conditionGroups = JsonSerializer.Deserialize<List<List<ResolvedConditionModel>>>(rawConditionsJson, s_caseInsensitiveConditionOptions);
        }
        else if (conditionsInput.Value is List<List<ResolvedConditionModel>> typedGroups)
        {
            conditionGroups = typedGroups;
        }

        if (conditionGroups is null || conditionGroups.Count == 0)
        {
            var passthroughLog = CreateBranchLog(node, null, rawConditionsJson);
            return Task.FromResult((FindNextEdgeTarget(flow, node.Id), passthroughLog));
        }

        // Resolve any template placeholders (e.g. {{ButtonPressed}}) in the condition values
        // so comparisons are made against the actual runtime values rather than raw strings.
        // For non-template literal strings, infer primitive types so numeric/boolean/date
        // comparisons behave the same as the legacy Windows Workflow implementation.
        foreach (var group in conditionGroups)
        {
            foreach (var condition in group)
            {
                var rawFirst = condition.FirstValue?.ToString();
                var rawSecond = condition.SecondValue?.ToString();

                condition.FirstValue = flowExecutionContext.ResolveTemplateObject(condition.FirstValue);
                condition.SecondValue = flowExecutionContext.ResolveTemplateObject(condition.SecondValue);

                if (condition.FirstValue is string s1 && rawFirst is not null && !rawFirst.Trim().StartsWith("{{"))
                    condition.FirstValue = InferType(s1);

                if (condition.SecondValue is string s2 && rawSecond is not null && !rawSecond.Trim().StartsWith("{{"))
                    condition.SecondValue = InferType(s2);
            }
        }

        var isTrue = ConditionEvaluator.Evaluate(conditionGroups);
        var resolvedConditionsJson = JsonSerializer.Serialize(conditionGroups, s_caseInsensitiveConditionOptions);

        var log = CreateBranchLog(node, isTrue, rawConditionsJson ?? resolvedConditionsJson, resolvedConditionsJson);

        if (isTrue)
        {
            return Task.FromResult((FindNextEdgeTarget(flow, node.Id), log));
        }

        return Task.FromResult<(string? NextNodeId, NodeExecutionLog Log)>((null, log));
    }

    private static NodeExecutionLog CreateBranchLog(
        ReactFlowNodeModel node,
        bool? conditionResult,
        string? rawConditions,
        string? resolvedConditions = null)
    {
        var outputs = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        if (conditionResult.HasValue)
        {
            outputs["BranchMatched"] = conditionResult.Value.ToString();
        }
        if (!string.IsNullOrWhiteSpace(resolvedConditions))
        {
            outputs["ResolvedConditions"] = resolvedConditions;
        }

        return new NodeExecutionLog
        {
            NodeId = node.Id,
            NodeName = string.IsNullOrWhiteSpace(node.Data?.Label) ? node.Type : node.Data.Label,
            NodeUniqueName = node.Data?.Name ?? node.Type,
            IsSuccess = true,
            Duration = 0,
            Inputs = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["Conditions"] = rawConditions ?? JsonSerializer.Serialize(node.Data?.Inputs?.FirstOrDefault(i =>
                    string.Equals(i.Key, "Conditions", StringComparison.OrdinalIgnoreCase))?.Value)
            },
            Outputs = outputs
        };
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
            // Keep the log list bounded so the final CloseJobAsync payload does not grow
            // unbounded on long-running flows. Oldest entries are dropped once the limit is
            // reached, preserving recent failure context.
            logs.EnqueueBounded(result.NodeLog, _maxNodeExecutionLogs);
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

    private (string? NextNodeId, NodeExecutionLog Log) ProcessConditionalNode(
        ReactFlowNodeModel node,
        ReactFlowDataModel flow,
        FlowExecutionContext flowExecutionContext,
        Dictionary<string, ConditionalBranchState> conditionalStates)
    {
        if (!conditionalStates.TryGetValue(node.Id, out var state))
        {
            var mergeNodeId = node.Data.MergeBranchesNodeId;
            if (string.IsNullOrWhiteSpace(mergeNodeId))
            {
                throw new InvalidOperationException($"Conditional node '{node.Id}' is missing merge node id.");
            }

            var conditionalMode = GetConditionalMode(node);
            var allBranches = ResolveConditionalBranches(node, flow, mergeNodeId);
            var branchStartNodes = allBranches
                .Select(b => flow.Nodes.FirstOrDefault(n => n.Id == b))
                .Where(n => n is not null)
                .ToList();

            // Evaluate each case branch in order and record the result so the router log is
            // useful for debugging.
            string? defaultBranchId = null;
            var matchingBranchIds = new List<string>();
            var branchEvaluations = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var branchNode in branchStartNodes)
            {
                var branchId = branchNode!.Id;
                var isDefault = string.Equals(branchNode.Data.Name, "DefaultBranch", StringComparison.OrdinalIgnoreCase);
                if (isDefault)
                {
                    defaultBranchId ??= branchId;
                    branchEvaluations[branchId] = "default";
                    continue;
                }

                var matched = EvaluateBranchConditions(branchNode, flowExecutionContext);
                branchEvaluations[branchId] = matched.ToString();
                if (matched)
                {
                    matchingBranchIds.Add(branchId);
                }
            }

            // Determine which branches to execute based on the configured mode.
            // SwitchCase: first matching case branch, or the default if none matched.
            // NestedIfElse: every matching case branch in order, plus the default branch
            // regardless of whether any case matched.
            var selectedBranches = new Queue<string>();
            var isNestedIfElse = string.Equals(conditionalMode, "NestedIfElse", StringComparison.OrdinalIgnoreCase);
            if (matchingBranchIds.Count > 0)
            {
                foreach (var branchId in matchingBranchIds)
                {
                    selectedBranches.Enqueue(branchId);
                    if (!isNestedIfElse)
                    {
                        break;
                    }
                }
            }

            if (isNestedIfElse && !string.IsNullOrWhiteSpace(defaultBranchId))
            {
                selectedBranches.Enqueue(defaultBranchId);
            }
            else if (matchingBranchIds.Count == 0 && !string.IsNullOrWhiteSpace(defaultBranchId))
            {
                selectedBranches.Enqueue(defaultBranchId);
            }

            var selectedBranchId = selectedBranches.Count > 0 ? selectedBranches.Peek() : null;
            var conditionalModeForLog = string.IsNullOrWhiteSpace(conditionalMode) ? "SwitchCase" : conditionalMode;

            state = new ConditionalBranchState
            {
                Id = node.Id,
                MergeBranchesNodeId = mergeNodeId,
                ConditionalMode = conditionalModeForLog,
                SelectedBranchId = selectedBranchId,
                BranchEvaluations = branchEvaluations,
                RemainingBranches = selectedBranches
            };
            conditionalStates[node.Id] = state;
        }

        var routerLog = CreateRouterLog(node, state);

        if (state.RemainingBranches.Count == 0)
        {
            conditionalStates.Remove(node.Id);
            return (state.MergeBranchesNodeId, routerLog);
        }

        state.ExecutedBranchesCount++;
        var nextNodeId = state.RemainingBranches.Dequeue();
        return (nextNodeId, routerLog);
    }

    private static string GetConditionalMode(ReactFlowNodeModel node)
    {
        var modeInput = node.Data?.Inputs?.FirstOrDefault(i =>
            string.Equals(i.Key, "ConditionalMode", StringComparison.OrdinalIgnoreCase));
        if (modeInput?.Value is null)
        {
            return "SwitchCase";
        }

        if (modeInput.Value is JsonElement jsonElement)
        {
            return jsonElement.ValueKind == JsonValueKind.String
                ? jsonElement.GetString() ?? "SwitchCase"
                : jsonElement.ToString() ?? "SwitchCase";
        }

        return modeInput.Value.ToString() ?? "SwitchCase";
    }

    private static NodeExecutionLog CreateRouterLog(ReactFlowNodeModel node, ConditionalBranchState state)
    {
        var outputs = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["SelectedBranchId"] = state.SelectedBranchId ?? "none",
            ["ExecutedBranchesCount"] = state.ExecutedBranchesCount.ToString()
        };

        foreach (var evaluation in state.BranchEvaluations)
        {
            outputs[$"Branch_{evaluation.Key}_Matched"] = evaluation.Value;
        }

        return new NodeExecutionLog
        {
            NodeId = node.Id,
            NodeName = string.IsNullOrWhiteSpace(node.Data?.Label) ? node.Type : node.Data.Label,
            NodeUniqueName = node.Data?.Name ?? node.Type,
            IsSuccess = true,
            Duration = 0,
            Inputs = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
            {
                ["ConditionalMode"] = state.ConditionalMode
            },
            Outputs = outputs
        };
    }

    private static bool EvaluateBranchConditions(ReactFlowNodeModel branchNode, FlowExecutionContext context)
    {
        var conditionsInput = branchNode.Data?.Inputs?.FirstOrDefault(i =>
            string.Equals(i.Key, "Conditions", StringComparison.OrdinalIgnoreCase));

        if (conditionsInput?.Value is null)
        {
            return false;
        }

        List<List<ResolvedConditionModel>>? conditionGroups = null;

        if (conditionsInput.Value is JsonElement jsonElement)
        {
            conditionGroups = JsonSerializer.Deserialize<List<List<ResolvedConditionModel>>>(jsonElement.GetRawText(), s_caseInsensitiveConditionOptions);
        }
        else if (conditionsInput.Value is List<List<ResolvedConditionModel>> typedGroups)
        {
            conditionGroups = typedGroups;
        }

        if (conditionGroups is null || conditionGroups.Count == 0)
        {
            return false;
        }

        foreach (var group in conditionGroups)
        {
            foreach (var condition in group)
            {
                var rawFirst = condition.FirstValue?.ToString();
                var rawSecond = condition.SecondValue?.ToString();

                condition.FirstValue = context.ResolveTemplateObject(condition.FirstValue);
                condition.SecondValue = context.ResolveTemplateObject(condition.SecondValue);

                if (condition.FirstValue is string s1 && rawFirst is not null && !rawFirst.Trim().StartsWith("{{"))
                    condition.FirstValue = InferType(s1);

                if (condition.SecondValue is string s2 && rawSecond is not null && !rawSecond.Trim().StartsWith("{{"))
                    condition.SecondValue = InferType(s2);
            }
        }

        return ConditionEvaluator.Evaluate(conditionGroups);
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
                    if (TryResolveForEachList(flowExecutionContext, loopState.ListVariableName, out var list))
                    {
                        var typedList = list.Cast<object?>().ToList();
                        if (loopState.CurrentIndex < typedList.Count)
                        {
                            var item = typedList[loopState.CurrentIndex];
                            if (!string.IsNullOrWhiteSpace(loopState.ItemVariableName))
                                flowExecutionContext.Set(loopState.ItemVariableName, item);
                            if (!string.IsNullOrWhiteSpace(loopState.ItemIndexVariableName))
                                flowExecutionContext.Set(loopState.ItemIndexVariableName, loopState.CurrentIndex);
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

            // While-loop (ConditionalLoop) semantics: re-evaluate the configured condition
            // against the live context after each pass through the body. Exit the loop when
            // the condition becomes false (or is missing/empty).
            if (EvaluateLoopCondition(parentNode, flowExecutionContext))
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
        if (loopStates.TryGetValue(node.Id, out var existing))
        {
            // Already initialized: only re-enter the body if the loop has not been closed.
            return existing.LoopBodyStartNodeId;
        }

        var mergeNodeId = node.Data.MergeBranchesNodeId;
        if (string.IsNullOrWhiteSpace(mergeNodeId))
        {
            throw new InvalidOperationException($"For loop node '{node.Id}' is missing merge node id.");
        }

        var bodyStartNodeId = ResolveLoopBodyStartNodeId(node, flow, mergeNodeId);

        var loopType = node.Data?.Inputs?.FirstOrDefault(i =>
            string.Equals(i.Key, "LoopType", StringComparison.OrdinalIgnoreCase))?.Value?.ToString() ?? "ConditionalLoop";

        if (string.Equals(loopType, "ForEachLoop", StringComparison.OrdinalIgnoreCase))
        {
            var listVarName = node.Data?.Inputs?.FirstOrDefault(i =>
                string.Equals(i.Key, "ListVariableName", StringComparison.OrdinalIgnoreCase))?.Value?.ToString() ?? string.Empty;

            // ItemVariableName / ItemIndexVariableName are declared on the loop node's
            // outputs (each output.Value.Value holds the variable alias, e.g. "CurrentItem").
            var itemVarName = GetLoopOutputAlias(node, "ItemVariableName");
            var indexVarName = GetLoopOutputAlias(node, "ItemIndexVariableName");

            var totalCount = 0;
            if (TryResolveForEachList(flowExecutionContext, listVarName, out var enumerable))
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

            var forEachState = new LoopState
            {
                Id = node.Id,
                LoopType = "ForEachLoop",
                MergeBranchesNodeId = mergeNodeId,
                LoopBodyStartNodeId = bodyStartNodeId,
                CurrentIteration = 0,
                CurrentIndex = 0,
                TotalCount = totalCount,
                ListVariableName = listVarName,
                ItemVariableName = itemVarName,
                ItemIndexVariableName = indexVarName
            };
            loopStates[node.Id] = forEachState;

            // Nothing to iterate over: skip the loop entirely.
            if (totalCount == 0)
            {
                loopStates.Remove(node.Id);
                return mergeNodeId;
            }

            return bodyStartNodeId;
        }

        // ConditionalLoop (while mode): the body runs while the configured condition
        // evaluates to true. The condition is re-evaluated against the live context on every
        // iteration (both on entry and when the loop body completes), matching the legacy
        // executor. There is no fixed iteration count — _maxLoopIterations is only a runaway
        // safety guard.
        var conditionMet = EvaluateLoopCondition(node, flowExecutionContext);

        var whileState = new LoopState
        {
            Id = node.Id,
            LoopType = "ConditionalLoop",
            MergeBranchesNodeId = mergeNodeId,
            LoopBodyStartNodeId = bodyStartNodeId,
            CurrentIteration = 0
        };
        loopStates[node.Id] = whileState;

        if (!conditionMet)
        {
            loopStates.Remove(node.Id);
            return mergeNodeId;
        }

        return bodyStartNodeId;
    }

    /// <summary>
    /// Reads the raw condition groups declared on a ConditionalLoop node's "Conditions" input and
    /// evaluates them against the live execution context. The raw input is re-read on every call so
    /// template placeholders are re-resolved against the latest context each iteration (matching the
    /// legacy executor). Non-template literal strings are type-inferred so numeric, boolean, and date
    /// comparisons behave correctly. Returns false when the input is absent, empty, or malformed.
    /// </summary>
    private static bool EvaluateLoopCondition(
        ReactFlowNodeModel node,
        FlowExecutionContext flowExecutionContext)
    {
        var conditionsInput = node.Data?.Inputs?.FirstOrDefault(i =>
            string.Equals(i.Key, "Conditions", StringComparison.OrdinalIgnoreCase));

        if (conditionsInput?.Value is null)
        {
            return false;
        }

        List<List<ResolvedConditionModel>>? conditionGroups = null;

        if (conditionsInput.Value is JsonElement jsonElement)
        {
            try
            {
                conditionGroups = JsonSerializer.Deserialize<List<List<ResolvedConditionModel>>>(
                    jsonElement.GetRawText(), s_caseInsensitiveConditionOptions);
            }
            catch
            {
                return false;
            }
        }
        else if (conditionsInput.Value is List<List<ResolvedConditionModel>> typedGroups)
        {
            conditionGroups = typedGroups;
        }

        if (conditionGroups is null || conditionGroups.Count == 0)
        {
            return false;
        }

        foreach (var group in conditionGroups)
        {
            if (group is null)
                continue;

            foreach (var condition in group)
            {
                if (condition is null)
                    continue;

                var rawFirst = condition.FirstValue?.ToString();
                var rawSecond = condition.SecondValue?.ToString();

                condition.FirstValue = flowExecutionContext.ResolveTemplateObject(condition.FirstValue);
                condition.SecondValue = flowExecutionContext.ResolveTemplateObject(condition.SecondValue);

                if (condition.FirstValue is string s1 && rawFirst is not null && !rawFirst.Trim().StartsWith("{{"))
                    condition.FirstValue = InferType(s1);

                if (condition.SecondValue is string s2 && rawSecond is not null && !rawSecond.Trim().StartsWith("{{"))
                    condition.SecondValue = InferType(s2);
            }
        }

        return ConditionEvaluator.Evaluate(conditionGroups);
    }

    /// <summary>
    /// Reads a loop output variable alias from the loop node's declared outputs. The frontend
    /// stores variable aliases such as ItemVariableName/ItemIndexVariableName on the loop node's
    /// outputs collection, where the alias is carried by each output's Value.Value (e.g. "CurrentItem").
    /// Falls back to the output key itself when the value is empty.
    /// </summary>
    private static string GetLoopOutputAlias(ReactFlowNodeModel node, string outputKey)
    {
        var output = node.Data?.Outputs?.FirstOrDefault(o =>
            string.Equals(o.Key, outputKey, StringComparison.OrdinalIgnoreCase));

        var alias = output?.Value?.Value?.Replace("{{", string.Empty).Replace("}}", string.Empty).Trim();
        return string.IsNullOrWhiteSpace(alias) ? output?.Key ?? string.Empty : alias;
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

    /// <summary>
    /// Resolves a ForEach list reference. The value may be a literal list object, a template
    /// expression like <tt>{{RandomNumbers}}</tt>, or a variable name. Returns true when an
    /// enumerable collection (other than a string) is found.
    /// </summary>
    private static bool TryResolveForEachList(
        FlowExecutionContext flowExecutionContext,
        string listVarName,
        out System.Collections.IEnumerable enumerable)
    {
        enumerable = Array.Empty<object?>();

        if (string.IsNullOrWhiteSpace(listVarName))
        {
            return false;
        }

        var resolved = flowExecutionContext.ResolveTemplateObject(listVarName);
        var listObj = resolved;

        if (resolved is string key && !string.IsNullOrWhiteSpace(key))
        {
            if (!flowExecutionContext.TryGet(key, out listObj) || listObj is null)
            {
                return false;
            }
        }

        if (listObj is null)
        {
            return false;
        }

        if (listObj is System.Data.DataTable dt)
        {
            enumerable = dt.Rows;
            return true;
        }

        if (listObj is System.Data.DataRowCollection rowCollection)
        {
            enumerable = rowCollection;
            return true;
        }

        // Handle JsonElement arrays by converting them to a list of objects
        if (listObj is JsonElement jsonElement && jsonElement.ValueKind == JsonValueKind.Array)
        {
            var convertedList = new List<object?>();
            foreach (var item in jsonElement.EnumerateArray())
            {
                convertedList.Add(ConvertJsonElement(item));
            }
            enumerable = convertedList;
            return true;
        }

        if (listObj is System.Collections.IEnumerable en && listObj is not string)
        {
            enumerable = en;
            return true;
        }

        return false;
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

    /// <summary>
    /// Recursively converts a JsonElement into a form suitable for DynamicExpresso evaluation.
    /// Objects become DynamicJson (supports both dot-notation and string indexing), arrays
    /// become lists, and primitives are unwrapped. This delegates to
    /// <see cref="JsonToDynamicConverter.ConvertJsonElement"/> so all conversion paths
    /// produce consistent types.
    /// </summary>
    private static object? ConvertJsonElement(JsonElement element)
        => JsonToDynamicConverter.ConvertJsonElement(element);

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

    /// <summary>
    /// Infers the strongest primitive type from a string value.
    /// Mirrors the legacy ActivityExecutorService.InferType behavior so that
    /// condition literals like "5", "true", or "2024-01-01" compare as numbers,
    /// booleans, or dates rather than as plain strings.
    /// </summary>
    private static object InferType(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return value;

        if (bool.TryParse(value, out var boolResult))
            return boolResult;

        if (int.TryParse(value, out var intResult))
            return intResult;

        if (long.TryParse(value, out var longResult))
            return longResult;

        if (decimal.TryParse(value, out var decResult))
            return decResult;

        if (double.TryParse(value, out var dblResult))
            return dblResult;

        if (DateTime.TryParse(value, out var dtResult))
            return dtResult;

        return value;
    }

    private static List<TriggerInputSchema> ParseTriggerInputs(string? inputOutputObjectJson)
    {
        if (string.IsNullOrWhiteSpace(inputOutputObjectJson))
        {
            return [];
        }

        try
        {
            var entries = JsonSerializer.Deserialize<List<InputOutputSchemaEntry>>(inputOutputObjectJson, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
            });

            if (entries is null)
            {
                return [];
            }

            return entries
                .Where(e => string.Equals(e.Direction, "Input", StringComparison.OrdinalIgnoreCase))
                .Select(e => new TriggerInputSchema(e.Name, e.DefaultValue, e.Required))
                .ToList();
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private sealed record InputOutputSchemaEntry(
        [property: JsonPropertyName("name")] string Name,
        [property: JsonPropertyName("direction")] string Direction,
        [property: JsonPropertyName("defaultValue")] object? DefaultValue = null,
        [property: JsonPropertyName("required")] bool Required = false);

    private sealed record TriggerInputSchema(string Name, object? DefaultValue, bool Required);
}
