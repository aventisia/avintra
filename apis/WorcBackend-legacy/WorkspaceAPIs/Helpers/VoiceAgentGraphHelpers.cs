using ExecutorLibrary.Helpers;
using ExecutorLibrary.Models;

namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Single-node VoiceAgent graph rules shared by publish validation and template normalization,
/// mirroring the studio <c>voice-agent-graph.util.ts</c> contract. The only executable node
/// allowed is the Voice AI node (<c>aiNode</c> named <c>CreateVoiceAIAgent</c>);
/// the <c>modelNode</c> support node may remain.
/// </summary>
public static class VoiceAgentGraphHelpers
{
    /// <summary>
    /// Name identifying the Voice AI action node.
    /// </summary>
    public const string VoiceAgentNodeName = "CreateVoiceAIAgent";

    /// <summary>
    /// Input key holding the who-speaks-first choice.
    /// </summary>
    public const string FirstSpeakerKey = "__FirstSpeaker__Voice";

    /// <summary>
    /// Input key holding the AI introduction.
    /// </summary>
    public const string IntroductionKey = "__Introduction__Voice";

    /// <summary>
    /// Input key holding the optional manager agent reference.
    /// </summary>
    public const string ManagerAgentKey = "__ManagerAgent__Voice";

    /// <summary>
    /// Input key holding the persona goal.
    /// </summary>
    public const string GoalKey = "__Goal__Voice";

    /// <summary>
    /// Input key holding the persona role.
    /// </summary>
    public const string RoleKey = "__Role__Voice";

    /// <summary>
    /// Input key holding the persona instructions.
    /// </summary>
    public const string InstructionsKey = "__Instructions__Voice";

    /// <summary>
    /// Structural node types from the generic agent shape that are never allowed in a VoiceAgent.
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
    /// Validates that a parsed graph satisfies the VoiceAgent single-node shape.
    /// </summary>
    /// <param name="parsedFlow">The parsed ReactFlow object.</param>
    /// <returns>An error message when invalid; otherwise, null.</returns>
    public static string? ValidateVoiceAgentGraph(ReactFlowDataModel? parsedFlow)
    {
        if (parsedFlow?.Nodes == null || parsedFlow.Nodes.Count == 0)
            return "Voice agent must contain a Voice AI node.";

        // The Voice AI node is the only executable node allowed
        var voiceNodes = parsedFlow.Nodes.Where(node =>
            string.Equals(node.Type, "aiNode", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(node.Data?.Name, VoiceAgentNodeName, StringComparison.OrdinalIgnoreCase)).ToList();

        if (voiceNodes.Count == 0)
            return "Voice agent must contain a Voice AI node.";

        if (voiceNodes.Count > 1)
            return "Voice agent must contain exactly one Voice AI node.";

        // Structural nodes from the generic agent shape must never be published
        var forbidden = parsedFlow.Nodes.FirstOrDefault(node => ForbiddenNodeTypes.Contains(node.Type ?? string.Empty));
        if (forbidden != null)
            return $"Voice agent cannot contain {forbidden.Type} nodes.";

        // Any other node type is rejected; only the model support node may remain
        var unexpected = parsedFlow.Nodes.FirstOrDefault(node =>
            !string.Equals(node.Type, "aiNode", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(node.Type, "modelNode", StringComparison.OrdinalIgnoreCase));
        if (unexpected != null)
            return $"Voice agent cannot contain {unexpected.Type} nodes.";

        // Edges must reference surviving nodes
        var nodeIds = new HashSet<string>(parsedFlow.Nodes.Select(node => node.Id), StringComparer.OrdinalIgnoreCase);
        var dangling = (parsedFlow.Edges ?? []).Any(edge =>
            string.IsNullOrWhiteSpace(edge.Source) ||
            string.IsNullOrWhiteSpace(edge.Target) ||
            !nodeIds.Contains(edge.Source) ||
            !nodeIds.Contains(edge.Target));
        if (dangling)
            return "Voice agent contains an edge with a missing source or target.";

        return null;
    }

    /// <summary>
    /// Validates the VoiceAgent conversation behaviour: an introduction is required
    /// only when the AI speaks first.
    /// </summary>
    /// <param name="parsedFlow">The parsed ReactFlow object.</param>
    /// <returns>An error message when invalid; otherwise, null.</returns>
    public static string? ValidateVoiceAgentConversation(ReactFlowDataModel? parsedFlow)
    {
        var voiceNode = FindVoiceAgentNode(parsedFlow);
        if (voiceNode is null)
            return null;

        if (!string.Equals(GetInputString(voiceNode, FirstSpeakerKey), "ai", StringComparison.OrdinalIgnoreCase))
            return null;

        if (!string.IsNullOrWhiteSpace(GetInputString(voiceNode, IntroductionKey)))
            return null;

        return "Voice agent introduction is required when the AI speaks first.";
    }

    /// <summary>
    /// Reads the who-speaks-first value from a persisted VoiceAgent ReactFlow object.
    /// Defaults to <c>human</c> when unset or unparseable so callers never open a
    /// conversation with an AI message by accident.
    /// </summary>
    /// <param name="reactFlowObject">The persisted ReactFlow object JSON.</param>
    /// <returns><c>ai</c> or <c>human</c>.</returns>
    public static string GetFirstSpeaker(string? reactFlowObject)
    {
        var parsedFlow = TryParseFlow(reactFlowObject);
        var voiceNode = FindVoiceAgentNode(parsedFlow);
        var firstSpeaker = GetInputString(voiceNode, FirstSpeakerKey);

        return string.Equals(firstSpeaker, "ai", StringComparison.OrdinalIgnoreCase) ? "ai" : "human";
    }

    /// <summary>
    /// Reads the configured introduction from a persisted VoiceAgent ReactFlow object.
    /// </summary>
    /// <param name="reactFlowObject">The persisted ReactFlow object JSON.</param>
    /// <returns>The introduction text, or an empty string when unset.</returns>
    public static string GetIntroduction(string? reactFlowObject)
    {
        var parsedFlow = TryParseFlow(reactFlowObject);
        var voiceNode = FindVoiceAgentNode(parsedFlow);

        return GetInputString(voiceNode, IntroductionKey) ?? string.Empty;
    }

    /// <summary>
    /// Normalizes a template VoiceAgent schema to the single-node shape while preserving all
    /// other fields. Falls back to the default VoiceAgent graph when no Voice AI node is
    /// present or the schema is unparseable.
    /// </summary>
    /// <param name="schema">The template schema JSON.</param>
    /// <param name="fallbackSchema">Default VoiceAgent graph used when normalization is impossible.</param>
    /// <returns>A VoiceAgent-shaped schema JSON.</returns>
    public static string NormalizeVoiceAgentSchema(string? schema, string fallbackSchema)
    {
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

        // Fall back when no Voice AI node exists to preserve
        var nodes = root["nodes"]?.AsArray() ?? root["Nodes"]?.AsArray();
        if (nodes == null)
            return fallbackSchema;

        var hasVoiceNode = nodes.Any(node =>
            string.Equals(node?["type"]?.GetValue<string>(), "aiNode", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(node?["data"]?["name"]?.GetValue<string>(), VoiceAgentNodeName, StringComparison.OrdinalIgnoreCase));
        if (!hasVoiceNode)
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

    private static ReactFlowNodeModel? FindVoiceAgentNode(ReactFlowDataModel? parsedFlow) =>
        parsedFlow?.Nodes?.FirstOrDefault(node =>
            string.Equals(node.Type, "aiNode", StringComparison.OrdinalIgnoreCase) &&
            string.Equals(node.Data?.Name, VoiceAgentNodeName, StringComparison.OrdinalIgnoreCase));

    private static string? GetInputString(ReactFlowNodeModel? node, string key)
    {
        var input = node?.Data?.Inputs?.FirstOrDefault(i =>
            string.Equals(i.Key, key, StringComparison.OrdinalIgnoreCase));
        if (input?.Value is null)
            return null;

        if (input.Value is JsonElement element)
            return element.ValueKind == JsonValueKind.String ? element.GetString() : element.ToString();

        return input.Value.ToString();
    }
}
