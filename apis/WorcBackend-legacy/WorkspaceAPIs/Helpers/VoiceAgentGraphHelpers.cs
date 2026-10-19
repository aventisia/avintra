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
    /// Input key holding the engine mode (realtime or pipeline).
    /// </summary>
    public const string EngineModeKey = "__EngineMode__Voice";

    /// <summary>
    /// Input key holding the realtime model configuration.
    /// </summary>
    public const string RealtimeVoiceKey = "__ModelConfig__RealtimeVoice";

    /// <summary>
    /// Input key holding the pipeline language model configuration.
    /// </summary>
    public const string PipelineLlmKey = "__ModelConfig__Voice";

    /// <summary>
    /// Input key holding the pipeline speech-to-text configuration.
    /// </summary>
    public const string PipelineSpeechToTextKey = "__ModelConfig__SpeechToText";

    /// <summary>
    /// Input key holding the pipeline text-to-speech configuration.
    /// </summary>
    public const string PipelineTextToSpeechKey = "__ModelConfig__TextToSpeech";

    /// <summary>
    /// Input key holding the dynamic variable defaults.
    /// </summary>
    public const string VariablesKey = "__Variables__Voice";

    /// <summary>
    /// Input key holding the pronunciation alias list.
    /// </summary>
    public const string PronunciationKey = "__Pronunciation__Voice";

    /// <summary>
    /// Input key holding the escalation destination.
    /// </summary>
    public const string EscalationDestinationKey = "__EscalationDestination__Voice";

    /// <summary>
    /// Input key holding the escalation condition.
    /// </summary>
    public const string EscalationConditionKey = "__EscalationCondition__Voice";

    /// <summary>
    /// Input key holding the escalation fallback choice.
    /// </summary>
    public const string EscalationFallbackKey = "__EscalationFallback__Voice";

    /// <summary>
    /// Input key holding the transcript webhook URL.
    /// </summary>
    public const string TranscriptWebhookUrlKey = "__TranscriptWebhookUrl__Voice";

    /// <summary>
    /// Input key holding the tool-call cue sound URL.
    /// </summary>
    public const string SfxToolCallCueUrlKey = "__SfxToolCallCueUrl__Voice";

    /// <summary>
    /// Input key holding the ambience sound URL.
    /// </summary>
    public const string SfxAmbienceUrlKey = "__SfxAmbienceUrl__Voice";

    /// <summary>
    /// Input key holding the sound-effects enabled flag.
    /// </summary>
    public const string SfxEnabledKey = "__SfxEnabled__Voice";

    /// <summary>
    /// Input key holding the dynamic variables enabled flag.
    /// </summary>
    public const string VariablesEnabledKey = "__VariablesEnabled__Voice";

    /// <summary>
    /// Input key holding the pronunciation enabled flag.
    /// </summary>
    public const string PronunciationEnabledKey = "__PronunciationEnabled__Voice";

    /// <summary>
    /// Input key holding the escalation enabled flag.
    /// </summary>
    public const string EscalationEnabledKey = "__EscalationEnabled__Voice";

    /// <summary>
    /// Input key holding the transcript webhook enabled flag.
    /// </summary>
    public const string TranscriptWebhookEnabledKey = "__TranscriptWebhookEnabled__Voice";

    /// <summary>
    /// Input key holding the tool-call cue enabled flag.
    /// </summary>
    public const string SfxToolCallCueEnabledKey = "__SfxToolCallCueEnabled__Voice";

    /// <summary>
    /// Input key holding the ambience enabled flag.
    /// </summary>
    public const string SfxAmbienceEnabledKey = "__SfxAmbienceEnabled__Voice";

    /// <summary>
    /// Engine modes accepted when publishing a VoiceAgent.
    /// </summary>
    public static readonly HashSet<string> AllowedEngineModes = new(StringComparer.OrdinalIgnoreCase)
    {
        "realtime",
        "pipeline"
    };

    /// <summary>
    /// Providers with an executable realtime transport in the llmpipeline gateway.
    /// </summary>
    public static readonly HashSet<string> AllowedRealtimeProviders = new(StringComparer.OrdinalIgnoreCase)
    {
        "openai",
        "azure",
        "gemini",
        "vertex_ai",
        "xai",
        "bedrock"
    };

    /// <summary>
    /// Escalation fallbacks accepted when publishing a VoiceAgent.
    /// </summary>
    public static readonly HashSet<string> AllowedEscalationFallbacks = new(StringComparer.OrdinalIgnoreCase)
    {
        "reprompt",
        "message",
        "end"
    };

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
    /// Validates the VoiceAgent engine selection: the mode must be supported and the
    /// provider/model pair must be executable for that mode.
    /// </summary>
    /// <param name="parsedFlow">The parsed ReactFlow object.</param>
    /// <returns>An error message when invalid; otherwise, null.</returns>
    public static string? ValidateVoiceAgentEngine(ReactFlowDataModel? parsedFlow)
    {
        var voiceNode = FindVoiceAgentNode(parsedFlow);
        if (voiceNode is null)
            return null;

        var engineMode = GetInputString(voiceNode, EngineModeKey);
        var mode = string.IsNullOrWhiteSpace(engineMode) ? "pipeline" : engineMode.Trim();

        if (!AllowedEngineModes.Contains(mode))
            return $"Voice agent engine mode '{engineMode}' is not supported. Supported modes: realtime, pipeline.";

        return string.Equals(mode, "realtime", StringComparison.OrdinalIgnoreCase)
            ? ValidateRealtimeEngine(voiceNode)
            : ValidatePipelineEngine(voiceNode);
    }

    /// <summary>
    /// Validates the VoiceAgent escalation configuration: an empty destination
    /// disables escalation, and a configured destination must carry a supported fallback.
    /// </summary>
    /// <param name="parsedFlow">The parsed ReactFlow object.</param>
    /// <returns>An error message when invalid; otherwise, null.</returns>
    public static string? ValidateVoiceAgentEscalation(ReactFlowDataModel? parsedFlow)
    {
        var voiceNode = FindVoiceAgentNode(parsedFlow);
        if (voiceNode is null)
            return null;

        if (GetInputBool(voiceNode, EscalationEnabledKey) == false)
            return null;

        var destination = GetInputString(voiceNode, EscalationDestinationKey);
        if (string.IsNullOrWhiteSpace(destination))
            return null;

        if (destination.Trim().Length > 200)
            return "Voice agent escalation destination cannot exceed 200 characters.";

        var fallback = GetInputString(voiceNode, EscalationFallbackKey);
        var normalizedFallback = string.IsNullOrWhiteSpace(fallback) ? "reprompt" : fallback.Trim();
        if (!AllowedEscalationFallbacks.Contains(normalizedFallback))
            return $"Voice agent escalation fallback '{fallback}' is not supported. Supported fallbacks: "
                + string.Join(", ", AllowedEscalationFallbacks.OrderBy(name => name, StringComparer.Ordinal)) + ".";

        return null;
    }

    /// <summary>
    /// Validates the VoiceAgent transcript webhook URL: when set, it must be an
    /// absolute http or https endpoint.
    /// </summary>
    /// <param name="parsedFlow">The parsed ReactFlow object.</param>
    /// <returns>An error message when invalid; otherwise, null.</returns>
    public static string? ValidateVoiceAgentTranscriptWebhook(ReactFlowDataModel? parsedFlow)
    {
        var voiceNode = FindVoiceAgentNode(parsedFlow);
        if (voiceNode is null)
            return null;

        if (GetInputBool(voiceNode, TranscriptWebhookEnabledKey) == false)
            return null;

        var url = GetInputString(voiceNode, TranscriptWebhookUrlKey);
        if (string.IsNullOrWhiteSpace(url))
            return null;

        return IsAbsoluteHttpUrl(url)
            ? null
            : "Voice agent transcript webhook URL must be an absolute http or https URL.";
    }

    private static bool IsAbsoluteHttpUrl(string value) =>
        Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri) &&
        (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);

    private static string? ValidateRealtimeEngine(ReactFlowNodeModel voiceNode)
    {
        var provider = GetInputObjectField(voiceNode, RealtimeVoiceKey, "provider");
        var model = GetInputObjectField(voiceNode, RealtimeVoiceKey, "model");

        if (IsUnsupportedProviderName(provider) || IsUnsupportedProviderName(model))
            return $"Voice agent provider '{provider ?? model}' is not supported for realtime voice.";

        if (string.IsNullOrWhiteSpace(provider) || string.IsNullOrWhiteSpace(model))
            return "Realtime engine mode requires a realtime provider and model.";

        var normalizedProvider = NormalizeRealtimeProvider(provider);
        if (IsUnsupportedProviderName(normalizedProvider))
            return $"Voice agent provider '{provider}' is not supported for realtime voice.";

        if (!AllowedRealtimeProviders.Contains(normalizedProvider))
            return $"Realtime voice provider '{provider}' is not supported. Supported providers: "
                + string.Join(", ", AllowedRealtimeProviders.OrderBy(name => name, StringComparer.Ordinal)) + ".";

        return null;
    }

    private static string? ValidatePipelineEngine(ReactFlowNodeModel voiceNode)
    {
        var components = new (string Key, string Label)[]
        {
            (PipelineSpeechToTextKey, "speech-to-text"),
            (PipelineLlmKey, "language model"),
            (PipelineTextToSpeechKey, "text-to-speech")
        };

        foreach (var component in components)
        {
            var provider = GetInputObjectField(voiceNode, component.Key, "provider");
            var model = GetInputObjectField(voiceNode, component.Key, "model");

            if (IsUnsupportedProviderName(provider) || IsUnsupportedProviderName(model))
                return $"Voice agent provider '{provider ?? model}' is not supported.";

            if (string.IsNullOrWhiteSpace(provider) || string.IsNullOrWhiteSpace(model))
                return $"Pipeline engine mode requires a {component.Label} provider and model.";
        }

        return null;
    }

    private static bool IsUnsupportedProviderName(string? value) =>
        value is not null && value.Contains("ultravox", StringComparison.OrdinalIgnoreCase);

    private static string NormalizeRealtimeProvider(string? value)
    {
        var trimmed = value?.Trim() ?? string.Empty;
        return trimmed.ToLowerInvariant() switch
        {
            "googlegemini" or "google" or "google_gemini" or "googleai" => "gemini",
            "vertex" => "vertex_ai",
            "amazon_nova" or "amazon-nova" => "bedrock",
            _ => trimmed
        };
    }

    private static string? GetInputObjectField(ReactFlowNodeModel? node, string key, string property)
    {
        var input = node?.Data?.Inputs?.FirstOrDefault(i =>
            string.Equals(i.Key, key, StringComparison.OrdinalIgnoreCase));
        if (input?.Value is not JsonElement element || element.ValueKind != JsonValueKind.Object)
            return null;

        return element.TryGetProperty(property, out var property_) && property_.ValueKind == JsonValueKind.String
            ? property_.GetString()
            : null;
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
    /// Reads the configured transcript webhook URL from a persisted VoiceAgent
    /// ReactFlow object, or null when unset.
    /// </summary>
    /// <param name="reactFlowObject">The persisted ReactFlow object JSON.</param>
    /// <returns>The webhook URL, or null when unset.</returns>
    public static string? GetTranscriptWebhookUrl(string? reactFlowObject)
    {
        var parsedFlow = TryParseFlow(reactFlowObject);
        var voiceNode = FindVoiceAgentNode(parsedFlow);

        return GetInputString(voiceNode, TranscriptWebhookUrlKey);
    }

    /// <summary>
    /// Reports whether the VoiceAgent transcript webhook is enabled for a persisted graph;
    /// an absent toggle keeps the legacy enabled behavior.
    /// </summary>
    /// <param name="reactFlowObject">The persisted ReactFlow object JSON.</param>
    /// <returns><c>false</c> only when the toggle is explicitly disabled.</returns>
    public static bool IsTranscriptWebhookEnabled(string? reactFlowObject)
    {
        var parsedFlow = TryParseFlow(reactFlowObject);
        var voiceNode = FindVoiceAgentNode(parsedFlow);

        return GetInputBool(voiceNode, TranscriptWebhookEnabledKey) != false;
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

    private static bool? GetInputBool(ReactFlowNodeModel? node, string key)
    {
        var input = node?.Data?.Inputs?.FirstOrDefault(i =>
            string.Equals(i.Key, key, StringComparison.OrdinalIgnoreCase));
        if (input?.Value is null)
            return null;

        if (input.Value is JsonElement element)
        {
            return element.ValueKind switch
            {
                JsonValueKind.True => true,
                JsonValueKind.False => false,
                JsonValueKind.String when bool.TryParse(element.GetString(), out var parsed) => parsed,
                _ => null,
            };
        }

        return input.Value is bool boolean ? boolean : null;
    }
}
