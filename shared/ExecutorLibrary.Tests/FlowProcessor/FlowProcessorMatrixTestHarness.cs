using System.Text.Json;
using ExecutorLibrary.FlowProcessor;
using ExecutorLibrary.FlowProcessor.Interfaces;
using ExecutorLibrary.FlowProcessor.Models;
using ExecutorLibrary.Models;

namespace ExecutorLibrary.Tests.FlowProcessor;

public static class FlowProcessorMatrixTestHarness
{
    public static int Run()
    {
        var failures = 0;
        failures += RunCase("OuterLoopCallsBlockWithInnerLoop", BuildOuterLoopWithInnerLoop, AssertOuterLoopWithInnerLoop);
        failures += RunCase("BlockContainsRouterBranch", BuildBlockWithRouter, AssertBlockWithRouter);
        failures += RunCase("NestedBlockCalls", BuildNestedBlocks, AssertNestedBlocks);

        failures += RunCase(
            "FailedSubFlowMarksCallerFailed",
            BuildBrokenSubFlow,
            AssertCallerFlipped,
            FlowExecutionStatus.Failed);

        failures += RunCase(
            "FailedSubFlowKeepsInnerStatus",
            BuildSubFlowWithFailingNode,
            AssertCallerKeepsInnerStatus,
            FlowExecutionStatus.Failed,
            new FailingNodeProcessor("broken-work"));

        failures += RunCase(
            "FailedNestedSubFlowDoesNotDoublePrefix",
            BuildNestedBlocksWithMissingInner,
            AssertNestedFailurePrefix,
            FlowExecutionStatus.Failed);

        var abortCts = new CancellationTokenSource();
        failures += RunCase(
            "AbortMarksInFlightNode",
            BuildSimpleFlow,
            AssertAbortMarker,
            FlowExecutionStatus.Aborted,
            new CancellingNodeProcessor(abortCts, "work"),
            abortCts.Token);

        var abortCallerCts = new CancellationTokenSource();
        failures += RunCase(
            "AbortMarksOpenSubFlowCaller",
            BuildBlockCallingCancelFlow,
            AssertAbortMarksCaller,
            FlowExecutionStatus.Aborted,
            new CancellingNodeProcessor(abortCallerCts, "work"),
            abortCallerCts.Token);

        var abortLoadCts = new CancellationTokenSource();
        var abortLoadScenario = BuildBlockCallingCancelFlow();
        failures += RunCase(
            "AbortDuringSubFlowLoadMarksCallerOnce",
            () => abortLoadScenario,
            AssertAbortMarksCaller,
            FlowExecutionStatus.Aborted,
            null,
            abortLoadCts.Token,
            new CancellingOnLoadFlowProvider(abortLoadScenario.SubFlows, abortLoadCts));

        failures += RunCase("CallAgentInLoopCarriesLoopContext", BuildOuterLoopCallingAgent, AssertCallAgentLoopContext);

        return failures;
    }

    private static int RunCase(
        string name,
        Func<(ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows)> build,
        Action<FlowExecutionResult> assert,
        FlowExecutionStatus expectedStatus = FlowExecutionStatus.Completed,
        INodeProcessor? nodeProcessor = null,
        CancellationToken cancellationToken = default,
        IFlowGraphProvider? providerOverride = null)
    {
        try
        {
            var scenario = build();
            var provider = providerOverride ?? new DictionaryFlowProvider(scenario.SubFlows);
            var processor = new ExecutorLibrary.FlowProcessor.FlowProcessor(nodeProcessor ?? new RecordingNodeProcessor(), provider);
            var result = processor.ExecuteAsync(
                scenario.Main,
                new Dictionary<string, object?> { ["items"] = new[] { 1, 2, 3 } },
                cancellationToken)
                .GetAwaiter()
                .GetResult();

            if (result.Status != expectedStatus)
                throw new InvalidOperationException($"Expected status {expectedStatus}, got {result.Status}: {result.ErrorMessage}");

            assert(result);
            Console.WriteLine($"  PASS: {name}");
            return 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"  FAIL: {name}");
            Console.WriteLine($"        {ex.Message}");
            return 1;
        }
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildOuterLoopWithInnerLoop()
    {
        var blockVersion = Guid.NewGuid();
        var main = CreateLinearLoopFlow("main-loop", "items", "call-block", blockVersion);
        var block = CreateLinearLoopFlow("block-loop", "items", "block-work", null);
        return (main, new Dictionary<Guid, ReactFlowDataModel> { [blockVersion] = block });
    }

    private static void AssertOuterLoopWithInnerLoop(FlowExecutionResult result)
    {
        var logs = result.NodeLogs;
        var callerLogs = logs.Where(log => log.NodeId == "call-block").ToList();
        AssertEqual(3, callerLogs.Count, "outer loop should invoke the block three times");
        AssertTrue(callerLogs.SequenceEqual(callerLogs.OrderBy(log => log.ExecutedAt)), "caller entries must remain in execution order");
        AssertEqual(0, callerLogs[0].LoopIterationIndex, "first block iteration");
        AssertEqual(1, callerLogs[1].LoopIterationIndex, "second block iteration");
        AssertEqual(2, callerLogs[2].LoopIterationIndex, "third block iteration");

        foreach (var callerLog in callerLogs)
        {
            var firstInternalLog = logs.First(log => log.CallerReferenceId == "call-block" && log.ExecutedAt >= callerLog.ExecutedAt);
            AssertTrue(firstInternalLog.ExecutedAt >= callerLog.ExecutedAt, "caller must precede internal logs");
            AssertEqual(callerLog.LoopIterationIndex, firstInternalLog.LoopIterationIndex, "inner log must retain outer loop iteration");
        }

        var innerLoopLogs = logs.Where(log => log.NodeId == "block-loop-loop").ToList();
        AssertEqual(12, innerLoopLogs.Count, "inner loop should log enter, continue, and exit for each block invocation");
        AssertTrue(innerLoopLogs.All(log => log.CallerReferenceId == "call-block"), "inner loop logs must retain the block caller");
        AssertTrue(innerLoopLogs.All(log => log.LoopReferenceId == "block-loop-loop"), "inner loop owns its loop reference");
        AssertTrue(innerLoopLogs.All(log => log.LoopIterationIndex >= 0), "inner loop logs must have an iteration index");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildBlockWithRouter()
    {
        var blockVersion = Guid.NewGuid();
        var main = CreateMainBlockFlow("call-router-block", blockVersion);
        var block = CreateRouterFlow("router-block");
        return (main, new Dictionary<Guid, ReactFlowDataModel> { [blockVersion] = block });
    }

    private static void AssertBlockWithRouter(FlowExecutionResult result)
    {
        var logs = result.NodeLogs;
        foreach (var nodeId in new[] { "router", "default-branch", "router-work", "router-branch-end", "router-merge" })
        {
            var log = logs.Single(item => item.NodeId == nodeId);
            AssertEqual("call-router-block", log.CallerReferenceId, $"{nodeId} caller reference");
        }
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildNestedBlocks()
    {
        var outerVersion = Guid.NewGuid();
        var innerVersion = Guid.NewGuid();
        var main = CreateMainBlockFlow("outer-block", outerVersion);
        var outer = CreateMainBlockFlow("inner-block", innerVersion);
        var inner = CreateSimpleActivityFlow("inner-work");
        return (main, new Dictionary<Guid, ReactFlowDataModel>
        {
            [outerVersion] = outer,
            [innerVersion] = inner
        });
    }

    private static void AssertNestedBlocks(FlowExecutionResult result)
    {
        var logs = result.NodeLogs;
        var outerLog = logs.Single(log => log.NodeId == "outer-block");
        var innerLog = logs.Single(log => log.NodeId == "inner-block");
        var workLog = logs.Single(log => log.NodeId == "inner-work");
        AssertEqual(string.Empty, outerLog.CallerReferenceId, "top-level block caller reference");
        AssertEqual("outer-block", innerLog.CallerReferenceId, "nested block caller reference");
        AssertEqual("inner-block", workLog.CallerReferenceId, "deep node caller reference");
        AssertTrue(logs.ToList().IndexOf(outerLog) < logs.ToList().IndexOf(innerLog), "outer block must precede nested block");
        AssertTrue(logs.ToList().IndexOf(innerLog) < logs.ToList().IndexOf(workLog), "nested block must precede deep work");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildSimpleFlow()
        => (CreateSimpleActivityFlow("work"), new Dictionary<Guid, ReactFlowDataModel>());

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildBrokenSubFlow()
        => (CreateMainBlockFlow("call-missing-block", Guid.NewGuid()), new Dictionary<Guid, ReactFlowDataModel>());

    private static void AssertCallerFlipped(FlowExecutionResult result)
    {
        var callerLog = result.NodeLogs.Single(log => log.NodeId == "call-missing-block");
        AssertTrue(!callerLog.IsSuccess, "block caller log must be marked failed");
        AssertTrue(callerLog.Outputs.TryGetValue("Status", out var status) && status.Contains("failed"), "caller log must carry a failure status");
        AssertTrue(result.ErrorMessage?.Contains("Sub-flow graph not found") == true, "flow must fail with the sub-flow error");
    }

    private static void AssertAbortMarker(FlowExecutionResult result)
    {
        var marker = result.NodeLogs.Single(log => log.NodeId == "work");
        AssertTrue(!marker.IsSuccess, "in-flight node marker must be unsuccessful");
        AssertEqual("Execution aborted.", marker.Outputs["Status"], "abort marker status");
        AssertEqual(0, result.NodeLogs.Count(log => log.NodeId == "simple-end"), "aborted flow must not log the End node");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildSubFlowWithFailingNode()
    {
        var blockVersion = Guid.NewGuid();
        var main = CreateMainBlockFlow("call-broken-block", blockVersion);
        var block = CreateSimpleActivityFlow("broken-work");
        return (main, new Dictionary<Guid, ReactFlowDataModel> { [blockVersion] = block });
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildBlockCallingCancelFlow()
    {
        var blockVersion = Guid.NewGuid();
        var main = CreateMainBlockFlow("call-cancel-block", blockVersion);
        var block = CreateSimpleActivityFlow("work");
        return (main, new Dictionary<Guid, ReactFlowDataModel> { [blockVersion] = block });
    }

    private static void AssertAbortMarksCaller(FlowExecutionResult result)
    {
        var callerLog = result.NodeLogs.Single(log => log.NodeId == "call-cancel-block");
        AssertTrue(!callerLog.IsSuccess, "open sub-flow caller must be marked aborted");
        AssertEqual("Sub-flow execution aborted.", callerLog.Outputs["Status"], "caller abort status");
        AssertEqual(0, result.NodeLogs.Count(log => log.NodeId == "main-end"), "aborted flow must not log the End node");
    }

    private static void AssertCallerKeepsInnerStatus(FlowExecutionResult result)
    {
        var callerLog = result.NodeLogs.Single(log => log.NodeId == "call-broken-block");
        AssertTrue(!callerLog.IsSuccess, "block caller log must be marked failed");
        AssertTrue(callerLog.Outputs["Status"].Contains("boom"), "caller log must carry the failing node's status");
        var brokenLog = result.NodeLogs.Single(log => log.NodeId == "broken-work");
        AssertTrue(!brokenLog.IsSuccess, "failing node log must be unsuccessful");
        AssertTrue(
            result.NodeLogs.ToList().IndexOf(brokenLog) > result.NodeLogs.ToList().IndexOf(callerLog),
            "failing node log must follow the caller log so the remark names the failing node");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildNestedBlocksWithMissingInner()
    {
        var outerVersion = Guid.NewGuid();
        var innerVersion = Guid.NewGuid();
        var main = CreateMainBlockFlow("outer-block", outerVersion);
        var outer = CreateMainBlockFlow("inner-block", innerVersion);
        return (main, new Dictionary<Guid, ReactFlowDataModel> { [outerVersion] = outer });
    }

    private static void AssertNestedFailurePrefix(FlowExecutionResult result)
    {
        var outer = result.NodeLogs.Single(log => log.NodeId == "outer-block");
        var status = outer.Outputs["Status"];
        AssertTrue(status.Contains("Sub-flow graph not found"), "outer caller must carry the inner failure");
        AssertTrue(
            !status.StartsWith("Node execution has failed: Node execution has failed:", StringComparison.Ordinal),
            "nested caller status must be prefixed once");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildOuterLoopCallingAgent()
    {
        var agentVersion = Guid.NewGuid();
        var main = CreateLinearLoopFlow("main-loop", "items", "call-agent", agentVersion);
        var body = main.Nodes.Single(node => node.Id == "call-agent");
        body.Type = "callAgentNode";
        body.Data.SelectedBlock = null;
        body.Data.SelectedAgent = JsonDocument.Parse($"{{\"id\":\"{agentVersion}\"}}").RootElement;
        var agent = CreateSimpleActivityFlow("agent-work");
        return (main, new Dictionary<Guid, ReactFlowDataModel> { [agentVersion] = agent });
    }

    private static void AssertCallAgentLoopContext(FlowExecutionResult result)
    {
        var callerLogs = result.NodeLogs.Where(log => log.NodeId == "call-agent").ToList();
        AssertEqual(3, callerLogs.Count, "loop invocations of the agent");
        for (var i = 0; i < callerLogs.Count; i++)
        {
            AssertEqual("main-loop-loop", callerLogs[i].LoopReferenceId, $"agent caller {i} loop reference");
            AssertEqual(i, callerLogs[i].LoopIterationIndex, $"agent caller {i} iteration");
            AssertEqual(string.Empty, callerLogs[i].CallerReferenceId, $"agent caller {i} caller reference");

            var workLog = result.NodeLogs.First(log => log.NodeId == "agent-work" && log.LoopIterationIndex == i);
            AssertEqual("call-agent", workLog.CallerReferenceId, $"agent work {i} caller reference");
            AssertEqual("main-loop-loop", workLog.LoopReferenceId, $"agent work {i} loop reference");
        }
    }

    private static ReactFlowDataModel CreateLinearLoopFlow(string prefix, string listVariable, string bodyNodeId, Guid? blockVersion)
    {
        var loopId = $"{prefix}-loop";
        var startId = $"{prefix}-start";
        var branchStartId = $"{prefix}-branch-start";
        var branchEndId = $"{prefix}-branch-end";
        var mergeId = $"{prefix}-merge";
        var endId = $"{prefix}-end";

        var body = blockVersion.HasValue
            ? Node(bodyNodeId, "blockNode", "CallBlockNode", selectedBlock: blockVersion.Value)
            : Node(bodyNodeId, "activityNode", "ActivityNode");
        body.Data.Inputs.Add(new ReactFlowNodeInput { Key = "ListVariableName", Value = listVariable });

        var flow = new ReactFlowDataModel
        {
            Nodes = new List<ReactFlowNodeModel>
            {
                Node(startId, "triggerNode", "manualTrigger"),
                Node(loopId, "forLoopNode", "Loop", inputs: new[] { new ReactFlowNodeInput { Key = "LoopType", Value = "ForEachLoop" }, new ReactFlowNodeInput { Key = "ListVariableName", Value = $"{{{{{listVariable}}}}}" } }, mergeId: mergeId),
                Node(branchStartId, "branchStartNode", "branchStartNode"),
                body,
                Node(branchEndId, "branchEndNode", "branchEndNode", parentId: loopId),
                Node(mergeId, "mergeBranchesNode", "mergeBranchesNode"),
                Node(endId, "flowEndNode", "flowEndNode")
            },
            Edges = new List<ReactFlowEdgeModel>
            {
                Edge(startId, loopId), Edge(loopId, branchStartId), Edge(branchStartId, bodyNodeId),
                Edge(bodyNodeId, branchEndId), Edge(branchEndId, mergeId, sourceHandle: "branch-return"),
                Edge(mergeId, loopId, type: "loopBack", sourceHandle: "branch-return"), Edge(mergeId, endId)
            }
        };
        return flow;
    }

    private static ReactFlowDataModel CreateMainBlockFlow(string blockNodeId, Guid blockVersion)
    {
        var start = Node("main-start", "triggerNode", "manualTrigger");
        var block = Node(blockNodeId, "blockNode", "CallBlockNode", selectedBlock: blockVersion);
        var end = Node("main-end", "flowEndNode", "flowEndNode");
        return new ReactFlowDataModel
        {
            Nodes = new List<ReactFlowNodeModel> { start, block, end },
            Edges = new List<ReactFlowEdgeModel> { Edge(start.Id, block.Id), Edge(block.Id, end.Id) }
        };
    }

    private static ReactFlowDataModel CreateSimpleActivityFlow(string activityId)
    {
        var start = Node("simple-start", "triggerNode", "manualTrigger");
        var activity = Node(activityId, "activityNode", "ActivityNode");
        var end = Node("simple-end", "flowEndNode", "flowEndNode");
        return new ReactFlowDataModel
        {
            Nodes = new List<ReactFlowNodeModel> { start, activity, end },
            Edges = new List<ReactFlowEdgeModel> { Edge(start.Id, activity.Id), Edge(activity.Id, end.Id) }
        };
    }

    private static ReactFlowDataModel CreateRouterFlow(string prefix)
    {
        var start = Node($"{prefix}-start", "triggerNode", "manualTrigger");
        var router = Node("router", "conditionalNode", "ConditionalActivity", branches: new[] { "default-branch" }, mergeId: "router-merge");
        var branch = Node("default-branch", "branchNode1", "DefaultBranch");
        var work = Node("router-work", "activityNode", "ActivityNode");
        var branchEnd = Node("router-branch-end", "branchEndNode", "branchEndNode", parentId: "router");
        var merge = Node("router-merge", "mergeBranchesNode", "mergeBranchesNode");
        var end = Node("router-end", "flowEndNode", "flowEndNode");
        return new ReactFlowDataModel
        {
            Nodes = new List<ReactFlowNodeModel> { start, router, branch, work, branchEnd, merge, end },
            Edges = new List<ReactFlowEdgeModel>
            {
                Edge(start.Id, router.Id), Edge(router.Id, branch.Id), Edge(branch.Id, work.Id),
                Edge(work.Id, branchEnd.Id), Edge(branchEnd.Id, merge.Id, sourceHandle: "branch-return"), Edge(merge.Id, end.Id)
            }
        };
    }

    private static ReactFlowNodeModel Node(
        string id,
        string type,
        string name,
        IEnumerable<ReactFlowNodeInput>? inputs = null,
        string? parentId = null,
        Guid? selectedBlock = null,
        IEnumerable<string>? branches = null,
        string? mergeId = null)
    {
        var data = new ReactFlowNodeData
        {
            Name = name,
            Label = name,
            Inputs = inputs?.ToList() ?? [],
            CustomParentId = parentId,
            Branches = branches?.ToList(),
            MergeBranchesNodeId = mergeId
        };
        if (selectedBlock.HasValue)
        {
            data.SelectedBlock = JsonDocument.Parse($"{{\"id\":\"{selectedBlock.Value}\"}}").RootElement;
        }
        return new ReactFlowNodeModel { Id = id, Type = type, Data = data };
    }

    private static ReactFlowEdgeModel Edge(string source, string target, string? type = null, string? sourceHandle = null)
        => new() { Id = $"{source}->{target}", Source = source, Target = target, Type = type, SourceHandle = sourceHandle };

    private static void AssertEqual<T>(T expected, T actual, string message)
    {
        if (!EqualityComparer<T>.Default.Equals(expected, actual))
            throw new InvalidOperationException($"{message}: expected '{expected}', got '{actual}'.");
    }

    private static void AssertTrue(bool condition, string message)
    {
        if (!condition)
            throw new InvalidOperationException(message);
    }

    private sealed class DictionaryFlowProvider(Dictionary<Guid, ReactFlowDataModel> flows) : IFlowGraphProvider
    {
        public Task<ReactFlowDataModel?> GetFlowGraphAsync(Guid flowVersionId, CancellationToken cancellationToken = default)
            => Task.FromResult(flows.TryGetValue(flowVersionId, out var flow) ? flow : null);
    }

    // Cancels the run while the sub-flow graph is being loaded: the caller log has already been
    // written and flipped at that moment, so this exercises the single-row abort path.
    private sealed class CancellingOnLoadFlowProvider(
        Dictionary<Guid, ReactFlowDataModel> flows,
        CancellationTokenSource cts) : IFlowGraphProvider
    {
        public Task<ReactFlowDataModel?> GetFlowGraphAsync(Guid flowVersionId, CancellationToken cancellationToken = default)
        {
            cts.Cancel();
            cancellationToken.ThrowIfCancellationRequested();
            return Task.FromResult(flows.TryGetValue(flowVersionId, out var flow) ? flow : null);
        }
    }

    private sealed class RecordingNodeProcessor : INodeProcessor
    {
        public Task<NodeExecutionResult> ExecuteAsync(ReactFlowNodeModel node, FlowExecutionContext context, CancellationToken cancellationToken = default)
        {
            return Task.FromResult(new NodeExecutionResult
            {
                IsSuccess = true,
                NodeLog = new NodeExecutionLog
                {
                    NodeId = node.Id,
                    NodeName = node.Data.Label,
                    NodeUniqueName = node.Data.Name,
                    IsSuccess = true,
                    CallerReferenceId = context.CallerReferenceId,
                    LoopReferenceId = context.LoopReferenceId,
                    LoopIterationIndex = context.LoopIterationIndex
                }
            });
        }
    }

    private sealed class CancellingNodeProcessor(CancellationTokenSource cts, string nodeId) : INodeProcessor
    {
        private readonly RecordingNodeProcessor _inner = new();

        public Task<NodeExecutionResult> ExecuteAsync(ReactFlowNodeModel node, FlowExecutionContext context, CancellationToken cancellationToken = default)
        {
            if (node.Id == nodeId)
            {
                cts.Cancel();
                cancellationToken.ThrowIfCancellationRequested();
            }

            return _inner.ExecuteAsync(node, context, cancellationToken);
        }
    }

    private sealed class FailingNodeProcessor(string nodeId) : INodeProcessor
    {
        public Task<NodeExecutionResult> ExecuteAsync(ReactFlowNodeModel node, FlowExecutionContext context, CancellationToken cancellationToken = default)
        {
            var isTarget = node.Id == nodeId;
            return Task.FromResult(new NodeExecutionResult
            {
                IsSuccess = !isTarget,
                NodeLog = new NodeExecutionLog
                {
                    NodeId = node.Id,
                    NodeName = node.Data.Label,
                    NodeUniqueName = node.Data.Name,
                    IsSuccess = !isTarget,
                    Outputs = isTarget
                        ? new Dictionary<string, string> { ["Status"] = "boom: failing node" }
                        : new Dictionary<string, string>(),
                    CallerReferenceId = context.CallerReferenceId,
                    LoopReferenceId = context.LoopReferenceId,
                    LoopIterationIndex = context.LoopIterationIndex
                }
            });
        }
    }
}