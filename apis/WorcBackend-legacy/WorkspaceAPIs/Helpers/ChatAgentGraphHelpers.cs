using ExecutorLibrary.Helpers;
using ExecutorLibrary.Models;

namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Single-node ChatAgent graph rules shared by publish validation and template normalization,
/// mirroring the studio <c>chat-agent-graph.util.ts</c> contract. The only executable node
/// allowed is the Chat AI node (<c>aiNode</c> named <c>CreateConversationAIAgent</c>);
/// the <c>modelNode</c> support node may remain.
/// </summary>
public static class ChatAgentGraphHelpers
{
    /// <summary>
    /// Name identifying the Chat AI action node.
    /// </summary>
    public const string ChatAgentNodeName = "CreateConversationAIAgent";

    /// <summary>
    /// Structural node types from the generic agent shape that are never allowed in a ChatAgent.
    /// </summary>
    public static readonly HashSet<string> ForbiddenNodeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "triggerNode",
        "plusNode",
        "plusFirstNode",
        "mergeBranchesNode",
        "branchStartNode",
        "branchNode1",
        "branchEndNode",
        "flowEndNode"
    };

    /// <summary>
    /// Validates that a parsed graph satisfies the ChatAgent single-node shape.
    /// </summary>
    /// <param name="parsedFlow">The parsed ReactFlow object.</param>
    /// <returns>An error message when invalid; otherwise, null.</returns>
    public static string? ValidateChatAgentGraph(ReactFlowDataModel? parsedFlow)
    {
        // Reject missing or empty graphs
        if (parsedFlow?.Nodes == null || parsedFlow.Nodes.Count == 0)
            return "Chat agent must contain a Chat AI node.";

        // The Chat AI node is the only executable node allowed
        var chatNodes = parsedFlow.Nodes.Where(node =>
            string.Equals(node.Type, "aiNode", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(node.Data?.Name, ChatAgentNodeName, StringComparison.OrdinalIgnoreCase)).ToList();

        if (chatNodes.Count == 0)
            return "Chat agent must contain a Chat AI node.";

        if (chatNodes.Count > 1)
            return "Chat agent must contain exactly one Chat AI node.";

        // Structural nodes from the generic agent shape must never be published
        var forbidden = parsedFlow.Nodes.FirstOrDefault(node => ForbiddenNodeTypes.Contains(node.Type ?? string.Empty));
        if (forbidden != null)
            return $"Chat agent cannot contain {forbidden.Type} nodes.";

        // Any other node type is rejected; only the model support node may remain
        var unexpected = parsedFlow.Nodes.FirstOrDefault(node =>
            !string.Equals(node.Type, "aiNode", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(node.Type, "modelNode", StringComparison.OrdinalIgnoreCase));
        if (unexpected != null)
            return $"Chat agent cannot contain {unexpected.Type} nodes.";

        // Edges must reference surviving nodes
        var nodeIds = new HashSet<string>(parsedFlow.Nodes.Select(node => node.Id), StringComparer.OrdinalIgnoreCase);
        var dangling = (parsedFlow.Edges ?? []).Any(edge =>
            string.IsNullOrWhiteSpace(edge.Source) ||
            string.IsNullOrWhiteSpace(edge.Target) ||
            !nodeIds.Contains(edge.Source) ||
            !nodeIds.Contains(edge.Target));
        if (dangling)
            return "Chat agent contains an edge with a missing source or target.";

        return null;
    }

    /// <summary>
    /// Normalizes a template ChatAgent schema to the single-node shape while preserving all
    /// other fields byte-for-byte. Falls back to the default ChatAgent graph when no Chat AI
    /// node is present or the schema is unparseable.
    /// </summary>
    /// <param name="schema">The template schema JSON.</param>
    /// <param name="fallbackSchema">Default ChatAgent graph used when normalization is impossible.</param>
    /// <returns>A ChatAgent-shaped schema JSON.</returns>
    public static string NormalizeChatAgentSchema(string? schema, string fallbackSchema)
    {
        // Fall back when the schema is missing or unparseable
        JsonObject? root;
        try
        {
            if (string.IsNullOrWhiteSpace(schema))
                return fallbackSchema;

            root = JsonNode.Parse(schema)?.AsObject();
            if (root == null)
                return fallbackSchema;
        }
        catch (System.Text.Json.JsonException)
        {
            return fallbackSchema;
        }

        // Fall back when no Chat AI node exists to preserve
        var nodes = root["nodes"]?.AsArray() ?? root["Nodes"]?.AsArray();
        if (nodes == null)
            return fallbackSchema;

        var hasChatNode = nodes.Any(node =>
            string.Equals(node?["type"]?.GetValue<string>(), "aiNode", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(node?["data"]?["name"]?.GetValue<string>(), ChatAgentNodeName, StringComparison.OrdinalIgnoreCase));
        if (!hasChatNode)
            return fallbackSchema;

        // Remove structural nodes and collect surviving ids
        var survivingIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        for (var i = nodes.Count - 1; i >= 0; i--)
        {
            var type = nodes[i]?["type"]?.GetValue<string>() ?? string.Empty;
            if (ForbiddenNodeTypes.Contains(type))
            {
                nodes.RemoveAt(i);
                continue;
            }

            var id = nodes[i]?["id"]?.GetValue<string>();
            if (!string.IsNullOrWhiteSpace(id))
                survivingIds.Add(id!);
        }

        // Remove edges touching removed nodes
        var edges = root["edges"]?.AsArray() ?? root["Edges"]?.AsArray();
        if (edges != null)
        {
            for (var i = edges.Count - 1; i >= 0; i--)
            {
                var source = edges[i]?["source"]?.GetValue<string>();
                var target = edges[i]?["target"]?.GetValue<string>();
                if (string.IsNullOrWhiteSpace(source) ||
                    string.IsNullOrWhiteSpace(target) ||
                    !survivingIds.Contains(source!) ||
                    !survivingIds.Contains(target!))
                {
                    edges.RemoveAt(i);
                }
            }
        }

        return root.ToJsonString();
    }

    /// <summary>
    /// Parses a ReactFlow object without throwing, returning null when invalid.
    /// ReactFlowHelper.Parse throws InvalidOperationException on malformed JSON.
    /// </summary>
    public static ReactFlowDataModel? TryParseFlow(string? reactFlowObject)
    {
        try
        {
            return ReactFlowHelper.Parse(reactFlowObject);
        }
        catch (InvalidOperationException)
        {
            return null;
        }
    }
}
