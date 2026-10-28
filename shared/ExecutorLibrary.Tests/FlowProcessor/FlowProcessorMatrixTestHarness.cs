using System.Text.Json;
using ExecutorLibrary.FlowProcessor;
using ExecutorLibrary.FlowProcessor.Interfaces;
using ExecutorLibrary.FlowProcessor.Models;
using ExecutorLibrary.Models;
using NodeLibrary.Enums;
using NodeLibrary.Models;

namespace ExecutorLibrary.Tests.FlowProcessor;

public static class FlowProcessorMatrixTestHarness
{
    public static int Run()
    {
        var failures = 0;
        failures += RunCase("OuterLoopCallsBlockWithInnerLoop", BuildOuterLoopWithInnerLoop, AssertOuterLoopWithInnerLoop);
        failures += RunCase("BlockContainsRouterBranch", BuildBlockWithRouter, AssertBlockWithRouter);
        failures += RunCase("NestedBlockCalls", BuildNestedBlocks, AssertNestedBlocks);
        failures += RunCase("BreakExitsLoopEarly", BuildBreakLoopFlow, AssertBreakLoopFlow);
        failures += RunCase("ContinueSkipsToNextIteration", BuildContinueLoopFlow, AssertContinueLoopFlow);
        failures += RunCase("BreakOutsideLoopFailsValidation", BuildBreakOutsideLoopFlow, AssertBreakOutsideLoopFails, expectFailure: true);
        failures += RunCase("ConditionalContinueSkipsMatchingIterations", BuildConditionalContinueFlow, AssertConditionalContinueFlow);
        failures += RunCase("ConditionalContinueFallsThroughWhenFalse", BuildAlwaysFalseContinueFlow, AssertAlwaysFalseContinueFlow);
        failures += RunCase("ConditionalBreakExitsOnMatchingIteration", BuildConditionalBreakFlow, AssertConditionalBreakFlow);
        failures += RunCase("ConditionalBreakFallsThroughWhenFalse", BuildAlwaysFalseBreakFlow, AssertAlwaysFalseBreakFlow);
        failures += RunCase("ContinueInsideRouterRepeatsEveryIteration", BuildContinueInsideRouterFlow, AssertContinueInsideRouterFlow);
        return failures;
    }

    private static int RunCase(
        string name,
        Func<(ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows)> build,
        Action<FlowExecutionResult> assert,
        bool expectFailure = false)
    {
        try
        {
            var scenario = build();
            var provider = new DictionaryFlowProvider(scenario.SubFlows);
            var processor = new ExecutorLibrary.FlowProcessor.FlowProcessor(new RecordingNodeProcessor(), provider);
            var result = processor.ExecuteAsync(
                scenario.Main,
                new Dictionary<string, object?> { ["items"] = new[] { 1, 2, 3 } })
                .GetAwaiter()
                .GetResult();

            if (!result.IsSuccess && !expectFailure)
                throw new InvalidOperationException(result.ErrorMessage ?? "Flow failed.");

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

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildBreakLoopFlow()
    {
        var main = CreateLoopWithFlowControl("break", "breakLoopNode");
        return (main, new Dictionary<Guid, ReactFlowDataModel>());
    }

    private static void AssertBreakLoopFlow(FlowExecutionResult result)
    {
        var logs = result.NodeLogs;
        AssertEqual(0, logs.Count(log => log.NodeId == "break-work"), "work after break must never execute");
        var breakLogs = logs.Where(log => log.NodeId == "break-control").ToList();
        AssertEqual(1, breakLogs.Count, "break must trigger exactly once");
        var loopLogs = logs.Where(log => log.NodeId == "break-loop").ToList();
        AssertTrue(loopLogs.Any(log => log.Outputs.TryGetValue("LoopStatus", out var status) && status == "enter"), "loop must enter");
        AssertTrue(loopLogs.Any(log => log.Outputs.TryGetValue("LoopStatus", out var status) && status == "exit"), "break must exit the loop");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildContinueLoopFlow()
    {
        var main = CreateLoopWithFlowControl("continue", "continueLoopNode");
        return (main, new Dictionary<Guid, ReactFlowDataModel>());
    }

    private static void AssertContinueLoopFlow(FlowExecutionResult result)
    {
        var logs = result.NodeLogs;
        AssertEqual(0, logs.Count(log => log.NodeId == "continue-work"), "work after continue must never execute");
        AssertEqual(3, logs.Count(log => log.NodeId == "continue-control"), "continue must trigger once per iteration");
        var loopLogs = logs.Where(log => log.NodeId == "continue-loop").ToList();
        AssertTrue(loopLogs.Any(log => log.Outputs.TryGetValue("LoopStatus", out var status) && status == "exit"), "loop must exit after all iterations");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildConditionalContinueFlow()
    {
        // Skips only the iteration where the current item equals 2.
        var conditions = new List<List<ResolvedConditionModel>>
        {
            new()
            {
                new ResolvedConditionModel
                {
                    FirstValue = "{{CurrentItem}}",
                    ComparisonOperator = ComparisonOperatorEnum.EqualTo,
                    SecondValue = "2"
                }
            }
        };
        var main = CreateLoopWithFlowControl("cond-continue", "continueLoopNode", conditions);
        return (main, new Dictionary<Guid, ReactFlowDataModel>());
    }

    private static void AssertConditionalContinueFlow(FlowExecutionResult result)
    {
        var logs = result.NodeLogs;
        var workLogs = logs.Where(log => log.NodeId == "cond-continue-work").ToList();
        AssertEqual(2, workLogs.Count, "work must run on the two iterations the condition skips");
        AssertEqual(3, logs.Count(log => log.NodeId == "cond-continue-control"), "continue must trigger once per iteration");
        var loopLogs = logs.Where(log => log.NodeId == "cond-continue-loop").ToList();
        AssertTrue(loopLogs.Any(log => log.Outputs.TryGetValue("LoopStatus", out var status) && status == "exit"), "loop must exit after all iterations");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildAlwaysFalseContinueFlow()
    {
        var conditions = new List<List<ResolvedConditionModel>>
        {
            new()
            {
                new ResolvedConditionModel
                {
                    FirstValue = "{{CurrentItem}}",
                    ComparisonOperator = ComparisonOperatorEnum.EqualTo,
                    SecondValue = "no-such-item"
                }
            }
        };
        var main = CreateLoopWithFlowControl("pass-continue", "continueLoopNode", conditions);
        return (main, new Dictionary<Guid, ReactFlowDataModel>());
    }

    private static void AssertAlwaysFalseContinueFlow(FlowExecutionResult result)
    {
        var logs = result.NodeLogs;
        AssertEqual(3, logs.Count(log => log.NodeId == "pass-continue-work"), "work must run on every iteration when the condition never holds");
        var controlLogs = logs.Where(log => log.NodeId == "pass-continue-control").ToList();
        AssertEqual(3, controlLogs.Count, "continue must trigger once per iteration");
        AssertTrue(controlLogs.All(log => log.Outputs.TryGetValue("Action", out var action) && action == "passthrough"), "non-matching iterations must fall through");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildConditionalBreakFlow()
    {
        // Breaks out when the current item equals 2: work runs on iteration 1 only.
        var conditions = new List<List<ResolvedConditionModel>>
        {
            new()
            {
                new ResolvedConditionModel
                {
                    FirstValue = "{{CurrentItem}}",
                    ComparisonOperator = ComparisonOperatorEnum.EqualTo,
                    SecondValue = "2"
                }
            }
        };
        var main = CreateLoopWithFlowControl("cond-break", "breakLoopNode", conditions);
        return (main, new Dictionary<Guid, ReactFlowDataModel>());
    }

    private static void AssertConditionalBreakFlow(FlowExecutionResult result)
    {
        var logs = result.NodeLogs;
        AssertEqual(1, logs.Count(log => log.NodeId == "cond-break-work"), "work must run only before the matching iteration breaks the loop");
        AssertEqual(2, logs.Count(log => log.NodeId == "cond-break-control"), "break must trigger on the first two iterations only");
        var loopLogs = logs.Where(log => log.NodeId == "cond-break-loop").ToList();
        AssertTrue(loopLogs.Any(log => log.Outputs.TryGetValue("LoopStatus", out var status) && status == "exit"), "break must exit the loop early");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildAlwaysFalseBreakFlow()
    {
        var conditions = new List<List<ResolvedConditionModel>>
        {
            new()
            {
                new ResolvedConditionModel
                {
                    FirstValue = "{{CurrentItem}}",
                    ComparisonOperator = ComparisonOperatorEnum.EqualTo,
                    SecondValue = "no-such-item"
                }
            }
        };
        var main = CreateLoopWithFlowControl("pass-break", "breakLoopNode", conditions);
        return (main, new Dictionary<Guid, ReactFlowDataModel>());
    }

    private static void AssertAlwaysFalseBreakFlow(FlowExecutionResult result)
    {
        var logs = result.NodeLogs;
        AssertEqual(3, logs.Count(log => log.NodeId == "pass-break-work"), "work must run on every iteration when the condition never holds");
        var controlLogs = logs.Where(log => log.NodeId == "pass-break-control").ToList();
        AssertEqual(3, controlLogs.Count, "break must trigger once per iteration");
        AssertTrue(controlLogs.All(log => log.Outputs.TryGetValue("Action", out var action) && action == "passthrough"), "non-matching iterations must fall through");
        var loopLogs = logs.Where(log => log.NodeId == "pass-break-loop").ToList();
        AssertTrue(loopLogs.Any(log => log.Outputs.TryGetValue("LoopStatus", out var status) && status == "exit"), "loop must exit normally after all iterations");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildBreakOutsideLoopFlow()
    {
        var start = Node("outside-start", "triggerNode", "manualTrigger");
        var control = Node("outside-break", "breakLoopNode", "BreakLoopNode");
        var end = Node("outside-end", "flowEndNode", "flowEndNode");
        var main = new ReactFlowDataModel
        {
            Nodes = new List<ReactFlowNodeModel> { start, control, end },
            Edges = new List<ReactFlowEdgeModel> { Edge(start.Id, control.Id), Edge(control.Id, end.Id) }
        };
        return (main, new Dictionary<Guid, ReactFlowDataModel>());
    }

    private static void AssertBreakOutsideLoopFails(FlowExecutionResult result)
    {
        AssertTrue(!result.IsSuccess, "break outside a loop must fail validation");
        AssertTrue((result.ErrorMessage ?? string.Empty).Contains("must be placed inside a loop body"), "validation must name the loop-body rule");
    }

    private static (ReactFlowDataModel Main, Dictionary<Guid, ReactFlowDataModel> SubFlows) BuildContinueInsideRouterFlow()
    {
        var loopId = "router-continue-loop";
        var routerId = "router-continue-router";
        var loop = Node(loopId, "forLoopNode", "Loop",
            inputs: new[]
            {
                new ReactFlowNodeInput { Key = "LoopType", Value = "ForEachLoop" },
                new ReactFlowNodeInput { Key = "ListVariableName", Value = "{{items}}" }
            },
            mergeId: "router-continue-loop-merge");
        loop.Data.Outputs.Add(new ReactFlowNodeOutput
        {
            Key = "ItemVariableName",
            Value = new ReactFlowNodeOutputValue { Value = "{{CurrentItem}}", Enabled = true }
        });

        var flow = new ReactFlowDataModel
        {
            Nodes = new List<ReactFlowNodeModel>
            {
                Node("router-continue-start", "triggerNode", "manualTrigger"),
                loop,
                Node("router-continue-body-start", "branchStartNode", "branchStartNode"),
                Node(routerId, "conditionalNode", "ConditionalActivity",
                    branches: new[] { "router-continue-branch" },
                    mergeId: "router-continue-router-merge"),
                Node("router-continue-branch", "branchNode1", "DefaultBranch"),
                Node("router-continue-control", "continueLoopNode", "ContinueLoopNode"),
                Node("router-continue-work", "activityNode", "ActivityNode"),
                Node("router-continue-branch-end", "branchEndNode", "branchEndNode", parentId: routerId),
                Node("router-continue-router-merge", "mergeBranchesNode", "mergeBranchesNode"),
                Node("router-continue-loop-end", "branchEndNode", "branchEndNode", parentId: loopId),
                Node("router-continue-loop-merge", "mergeBranchesNode", "mergeBranchesNode"),
                Node("router-continue-end", "flowEndNode", "flowEndNode")
            },
            Edges = new List<ReactFlowEdgeModel>
            {
                Edge("router-continue-start", loopId),
                Edge(loopId, "router-continue-body-start"),
                Edge("router-continue-body-start", routerId),
                Edge(routerId, "router-continue-branch"),
                Edge("router-continue-branch", "router-continue-control"),
                Edge("router-continue-control", "router-continue-branch-end"),
                Edge("router-continue-branch-end", "router-continue-router-merge", sourceHandle: "branch-return"),
                Edge("router-continue-router-merge", "router-continue-work"),
                Edge("router-continue-work", "router-continue-loop-end"),
                Edge("router-continue-loop-end", "router-continue-loop-merge", sourceHandle: "branch-return"),
                Edge("router-continue-loop-merge", loopId, type: "loopBack", sourceHandle: "branch-return"),
                Edge("router-continue-loop-merge", "router-continue-end")
            }
        };
        return (flow, new Dictionary<Guid, ReactFlowDataModel>());
    }

    private static void AssertContinueInsideRouterFlow(FlowExecutionResult result)
    {
        var logs = result.NodeLogs;
        AssertEqual(3, logs.Count(log => log.NodeId == "router-continue-control"), "the router branch must continue once per iteration");
        AssertEqual(0, logs.Count(log => log.NodeId == "router-continue-work"), "work after the router must never run while the branch keeps continuing");
    }

    private static ReactFlowDataModel CreateLoopWithFlowControl(string prefix, string controlType, object? controlConditions = null)
    {
        var loopId = $"{prefix}-loop";
        var startId = $"{prefix}-start";
        var branchStartId = $"{prefix}-branch-start";
        var controlId = $"{prefix}-control";
        var workId = $"{prefix}-work";
        var branchEndId = $"{prefix}-branch-end";
        var mergeId = $"{prefix}-merge";
        var endId = $"{prefix}-end";

        var controlInputs = new List<ReactFlowNodeInput>();
        if (controlConditions is not null)
        {
            controlInputs.Add(new ReactFlowNodeInput { Key = "Conditions", Value = controlConditions });
        }

        var loopNode = Node(loopId, "forLoopNode", "Loop", inputs: new[] { new ReactFlowNodeInput { Key = "LoopType", Value = "ForEachLoop" }, new ReactFlowNodeInput { Key = "ListVariableName", Value = "{{items}}" } }, mergeId: mergeId);
        loopNode.Data.Outputs.Add(new ReactFlowNodeOutput { Key = "ItemVariableName", Value = new ReactFlowNodeOutputValue { Value = "{{CurrentItem}}", Enabled = true } });

        var flow = new ReactFlowDataModel
        {
            Nodes = new List<ReactFlowNodeModel>
            {
                Node(startId, "triggerNode", "manualTrigger"),
                loopNode,
                Node(branchStartId, "branchStartNode", "branchStartNode"),
                Node(controlId, controlType, controlType, inputs: controlInputs),
                Node(workId, "activityNode", "ActivityNode"),
                Node(branchEndId, "branchEndNode", "branchEndNode", parentId: loopId),
                Node(mergeId, "mergeBranchesNode", "mergeBranchesNode"),
                Node(endId, "flowEndNode", "flowEndNode")
            },
            Edges = new List<ReactFlowEdgeModel>
            {
                Edge(startId, loopId), Edge(loopId, branchStartId), Edge(branchStartId, controlId),
                Edge(controlId, workId), Edge(workId, branchEndId), Edge(branchEndId, mergeId, sourceHandle: "branch-return"),
                Edge(mergeId, loopId, type: "loopBack", sourceHandle: "branch-return"), Edge(mergeId, endId)
            }
        };
        return flow;
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
}