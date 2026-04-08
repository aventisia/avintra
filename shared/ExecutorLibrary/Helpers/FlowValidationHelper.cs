namespace ExecutorLibrary.Helpers;

public static class FlowValidationHelper
{
    /// <summary>
    /// Support/placeholder node types that are not considered as executable nodes. If a flow contains 
    /// only these types of nodes, it will be treated as an empty flow and rejected for
    /// </summary>
    public static readonly HashSet<string> SupportNodeTypes =
    [
        "triggerNode",
        "plusNode",
        "plusFirstNode",
        "mergeBranchesNode",
        "branchStartNode",
        "branchNode1",
        "branchEndNode",
        "ifElseNode",
        "conditionalNode",
        "whileLoopNode",
        "forLoopNode",
        "forEachLoopNode",
        "flowEndNode"
    ];

    /// <summary>
    /// Check if the flow is empty by counting the number of executable nodes (nodes that are not in the SupportNodeTypes list). If there are no executable nodes, the flow is considered empty.
    /// </summary> 
    public static bool IsEmptyFlow(ReactFlowDataModel flow)
    {
        var executableNodeCount = flow.Nodes.Count(node => !SupportNodeTypes.Contains(node.Type));
        return executableNodeCount == 0;
    }

    /// <summary>
    /// Determine if a node is a desktop-only executable node based on its type and supported platforms.
    /// Examples rejected: [windows], [linux], [windows, linux].
    /// Examples allowed: [cloud, windows], [cloud], [cloud, linux], [cloud, windows, linux], []. 
    /// Note: If SupportedPlatforms property is missing or empty, we will consider the node as cross-platform and allow it to be executed.
    /// </summary>
    public static bool DoesFlowContainsAnyDesktopOnlyNode(ReactFlowDataModel flow)
    {
        var desktopOnlyNodeCount = flow.Nodes.Count(node =>
        {
            // Return if support node types since they are not executable nodes
            if (SupportNodeTypes.Contains(node.Type)) return false;

            // Return if node is disabled
            if (node.Data?.IsDisabled == true) return false;

            // If SupportedPlatforms is missing or empty or contains "cloud", consider the node executable on cloud
            var supportedPlatforms = node.Data?.SupportedPlatforms;
            return supportedPlatforms?.Any() == true && !supportedPlatforms.Contains(SupportedPlatformEnum.Cloud);
        });

        return desktopOnlyNodeCount > 0;
    }

    /// <summary>
    /// Validates the structure of a Flow graph.
    /// </summary>
    /// <param name="flow">The Flow graph to validate.</param>
    /// <returns>
    /// A string describing the validation error if the graph is invalid; otherwise, null if the graph is valid.
    /// </returns>
    public static string? IsValidFlowGraph(ReactFlowDataModel flow)
    {
        var nodes = flow.Nodes ?? new List<ReactFlowNodeModel>();
        var edges = flow.Edges ?? new List<ReactFlowEdgeModel>();

        if (nodes.Count == 0)
        {
            return "Flow has no nodes.";
        }

        var nodeIdSet = new HashSet<string>(nodes.Select(n => n.Id), StringComparer.OrdinalIgnoreCase);
        foreach (var edge in edges)
        {
            if (string.IsNullOrWhiteSpace(edge.Source) || string.IsNullOrWhiteSpace(edge.Target))
            {
                return "Flow contains edge(s) with missing source or target.";
            }

            if (!nodeIdSet.Contains(edge.Source) || !nodeIdSet.Contains(edge.Target))
            {
                return $"Flow contains dangling edge: '{edge.Source}' -> '{edge.Target}'.";
            }
        }

        foreach (var conditionalNode in nodes.Where(n => string.Equals(n.Type, "conditionalNode", StringComparison.OrdinalIgnoreCase)))
        {
            if (string.IsNullOrWhiteSpace(conditionalNode.Data.MergeBranchesNodeId))
            {
                return $"Conditional node '{conditionalNode.Id}' is missing merge node id.";
            }

            if (!nodeIdSet.Contains(conditionalNode.Data.MergeBranchesNodeId))
            {
                return $"Conditional node '{conditionalNode.Id}' has invalid merge node id '{conditionalNode.Data.MergeBranchesNodeId}'.";
            }

            var branches = ResolveConditionalBranches(conditionalNode, flow, conditionalNode.Data.MergeBranchesNodeId);
            if (branches.Count == 0)
            {
                return $"Conditional node '{conditionalNode.Id}' has no branch entry nodes.";
            }
        }

        foreach (var loopNode in nodes.Where(n => string.Equals(n.Type, "forLoopNode", StringComparison.OrdinalIgnoreCase)))
        {
            if (string.IsNullOrWhiteSpace(loopNode.Data.MergeBranchesNodeId))
            {
                return $"For loop node '{loopNode.Id}' is missing merge node id.";
            }

            if (!nodeIdSet.Contains(loopNode.Data.MergeBranchesNodeId))
            {
                return $"For loop node '{loopNode.Id}' has invalid merge node id '{loopNode.Data.MergeBranchesNodeId}'.";
            }

            var hasBodyEdge = edges.Any(e =>
                e.Source == loopNode.Id &&
                !string.Equals(e.Target, loopNode.Data.MergeBranchesNodeId, StringComparison.OrdinalIgnoreCase));

            if (!hasBodyEdge)
            {
                return $"For loop node '{loopNode.Id}' has no loop body entry edge.";
            }
        }

        return null;
    }

    // TODO: We need to put it in better helper class since it is being repeated inside the FlowProcessor as well. We can consider putting it in ReactFlowHelper or create a new helper class for conditional node related logic.
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
}