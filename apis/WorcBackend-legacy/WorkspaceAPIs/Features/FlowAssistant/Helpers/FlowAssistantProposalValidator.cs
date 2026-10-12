using WorkspaceAPIs.Features.FlowAssistant.DTOs;
using WorkspaceAPIs.Features.FlowAssistant.Generated;

namespace WorkspaceAPIs.Features.FlowAssistant.Helpers;

/// <summary>
/// Validates a model-produced graph proposal against the curated allowlist and the current graph.
/// </summary>
public static class FlowAssistantProposalValidator
{
    /// <summary>
    /// Returns a human-readable error when the proposal is invalid, or null when it is acceptable.
    /// </summary>
    public static string? Validate(JsonElement proposal, FlowAssistantGraphContextDto graph)
    {
        if (proposal.ValueKind != JsonValueKind.Object)
            return "The proposal was not a JSON object.";

        if (!TryGetString(proposal, "summary", out var summary) || string.IsNullOrWhiteSpace(summary))
            return "The proposal is missing a summary.";

        if (!TryGetString(proposal, "mode", out var mode) || (mode != "create" && mode != "edit"))
            return "The proposal mode is invalid.";

        if (!proposal.TryGetProperty("operations", out var operations) || operations.ValueKind != JsonValueKind.Array)
            return "The proposal has no operations.";

        if (operations.GetArrayLength() == 0)
            return "The proposal has no operations.";

        var baseNodeIds = BuildBaseNodeIds(graph, mode == "create");
        var baseEdgeIds = new HashSet<string>();
        foreach (var edge in graph.Edges)
        {
            if (TryGetString(edge, "id", out var edgeId) && !string.IsNullOrWhiteSpace(edgeId))
                baseEdgeIds.Add(edgeId);
        }

        var addedNodeIds = new HashSet<string>();
        var removedNodeIds = new HashSet<string>();
        var addedEdgeIds = new HashSet<string>();

        foreach (var operation in operations.EnumerateArray())
        {
            if (operation.ValueKind != JsonValueKind.Object)
                return "An operation was not a JSON object.";

            if (!TryGetString(operation, "type", out var operationType))
                return "An operation is missing its type.";

            switch (operationType)
            {
                case "addNode":
                case "updateNode":
                {
                    if (!operation.TryGetProperty("node", out var node) || node.ValueKind != JsonValueKind.Object)
                        return $"The {operationType} operation has no node.";

                    if (!TryGetString(node, "type", out var nodeType) || !TryGetString(node, "name", out var nodeName))
                        return "A proposed node is missing its type or name.";

                    if (!IsAllowedNode(nodeType, nodeName))
                        return $"Unsupported node \"{nodeName}\".";

                    if (!TryGetString(node, "id", out var nodeId) || string.IsNullOrWhiteSpace(nodeId))
                        return "A proposed node is missing its id.";

                    if (operationType == "addNode")
                    {
                        if (baseNodeIds.Contains(nodeId) || addedNodeIds.Contains(nodeId))
                            return $"Duplicate node id \"{nodeId}\".";
                        addedNodeIds.Add(nodeId);
                    }
                    else if (!baseNodeIds.Contains(nodeId) && !addedNodeIds.Contains(nodeId))
                    {
                        return $"Update references missing node \"{nodeId}\".";
                    }

                    break;
                }
                case "removeNode":
                {
                    if (!TryGetString(operation, "id", out var removedId) || string.IsNullOrWhiteSpace(removedId))
                        return "A removeNode operation is missing its id.";

                    if (!baseNodeIds.Contains(removedId))
                        return $"Removal references missing node \"{removedId}\".";

                    removedNodeIds.Add(removedId);
                    break;
                }
                case "addEdge":
                {
                    if (!operation.TryGetProperty("edge", out var edge) || edge.ValueKind != JsonValueKind.Object)
                        return "An addEdge operation has no edge.";

                    if (!TryGetString(edge, "id", out var addedEdgeId) || string.IsNullOrWhiteSpace(addedEdgeId))
                        return "An edge is missing its id.";

                    if (!TryGetString(edge, "source", out var source) || !TryGetString(edge, "target", out var target))
                        return "An edge is missing its source or target.";

                    var knownNodeIds = new HashSet<string>(baseNodeIds);
                    knownNodeIds.UnionWith(addedNodeIds);
                    knownNodeIds.ExceptWith(removedNodeIds);

                    if (!knownNodeIds.Contains(source) || !knownNodeIds.Contains(target))
                        return $"Edge \"{addedEdgeId}\" references a missing node.";

                    if (baseEdgeIds.Contains(addedEdgeId) || addedEdgeIds.Contains(addedEdgeId))
                        return $"Duplicate edge id \"{addedEdgeId}\".";

                    addedEdgeIds.Add(addedEdgeId);
                    break;
                }
                case "removeEdge":
                {
                    if (!TryGetString(operation, "id", out var removedEdgeId) || string.IsNullOrWhiteSpace(removedEdgeId))
                        return "A removeEdge operation is missing its id.";

                    if (!baseEdgeIds.Contains(removedEdgeId))
                        return $"Removal references missing edge \"{removedEdgeId}\".";

                    break;
                }
                default:
                    return $"Unsupported operation \"{operationType}\".";
            }
        }

        return null;
    }

    private static HashSet<string> BuildBaseNodeIds(FlowAssistantGraphContextDto graph, bool structuralOnly)
    {
        var nodeIds = new HashSet<string>();
        foreach (var node in graph.Nodes)
        {
            if (!TryGetString(node, "id", out var id) || string.IsNullOrWhiteSpace(id))
                continue;

            if (!structuralOnly || IsStructuralNode(node))
                nodeIds.Add(id);
        }

        return nodeIds;
    }

    private static bool IsStructuralNode(JsonElement node) =>
        TryGetString(node, "type", out var type) && (type == "triggerNode" || type == "flowEndNode");

    private static bool IsAllowedNode(string type, string name) =>
        FlowAssistantCatalog.AllowedNodes.Any(node => node.Type == type && node.Name == name);

    private static bool TryGetString(JsonElement element, string propertyName, out string value)
    {
        value = string.Empty;
        if (element.ValueKind != JsonValueKind.Object)
            return false;
        if (!element.TryGetProperty(propertyName, out var property) || property.ValueKind != JsonValueKind.String)
            return false;

        value = property.GetString() ?? string.Empty;
        return true;
    }
}
