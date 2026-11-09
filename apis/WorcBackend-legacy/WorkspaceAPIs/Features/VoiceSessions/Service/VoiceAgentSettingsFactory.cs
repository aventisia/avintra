using System.Globalization;
using WorkspaceAPIs.Features.VoiceSessions.DTOs;

namespace WorkspaceAPIs.Features.VoiceSessions.Service;

/// <summary>
/// Builds resolved VoiceAgent settings without database, HTTP, or user-context side effects.
/// </summary>
public static class VoiceAgentSettingsFactory
{
    /// <summary>The guidance that keeps generated text suitable for speech.</summary>
    public const string SpokenStyleGuidance =
        "Use short sentences and plain spoken language. Do not use Markdown, bullet points, numbered lists, or other formatting.";

    private static readonly Regex VoiceVariablePattern =
        new(@"\{\{\s*([a-zA-Z0-9_.]+)\s*\}\}", RegexOptions.Compiled | RegexOptions.CultureInvariant);

    /// <summary>
    /// Creates resolved settings from one persisted Voice AI node configuration.
    /// </summary>
    public static VoiceAgentSettingsDto Create(
        Guid flowVersionId,
        Guid flowId,
        string? agentName,
        JsonObject nodeConfig)
    {
        var variables = ReadVariables(nodeConfig);
        var firstSpeaker = NormalizeFirstSpeaker(GetString(nodeConfig, VoiceAgentGraphHelpers.FirstSpeakerKey));
        var goal = ResolveVariables(nodeConfig, GetString(nodeConfig, VoiceAgentGraphHelpers.GoalKey), variables);
        var role = ResolveVariables(nodeConfig, GetString(nodeConfig, VoiceAgentGraphHelpers.RoleKey), variables);
        var instructions = ResolveVariables(nodeConfig, GetString(nodeConfig, VoiceAgentGraphHelpers.InstructionsKey), variables);
        var introduction = string.Equals(firstSpeaker, "ai", StringComparison.Ordinal)
            ? ResolveVariables(nodeConfig, GetString(nodeConfig, VoiceAgentGraphHelpers.IntroductionKey), variables)
            : null;

        return new VoiceAgentSettingsDto
        {
            FlowVersionId = flowVersionId,
            FlowId = flowId,
            AgentName = agentName ?? string.Empty,
            EngineMode = NormalizeEngineMode(GetString(nodeConfig, VoiceAgentGraphHelpers.EngineModeKey)),
            FirstSpeaker = firstSpeaker,
            Introduction = introduction,
            Llm = ReadModel(GetObject(nodeConfig, VoiceAgentGraphHelpers.PipelineLlmKey)),
            Stt = ReadModel(GetObject(nodeConfig, VoiceAgentGraphHelpers.PipelineSpeechToTextKey)),
            Tts = ReadModel(GetObject(nodeConfig, VoiceAgentGraphHelpers.PipelineTextToSpeechKey)),
            Realtime = ReadModel(GetObject(nodeConfig, VoiceAgentGraphHelpers.RealtimeVoiceKey)),
            TtsVoice = ReadOutput(GetObject(nodeConfig, VoiceAgentGraphHelpers.PipelineVoiceKey)),
            Persona = new VoicePersonaSettingsDto
            {
                Goal = goal,
                Role = role,
                Instructions = instructions,
                SystemPrompt = ComposeSystemPrompt(goal, role, instructions),
            },
            SpokenStyleGuidance = SpokenStyleGuidance,
            Tools = ReadTools(GetArray(nodeConfig, VoiceAgentGraphHelpers.ToolsConfigKey)),
            KnowledgeBase = ReadKnowledgeBase(GetObject(nodeConfig, VoiceAgentGraphHelpers.KnowledgeBaseConfigKey)),
            Skills = ReadStringArray(GetObject(nodeConfig, VoiceAgentGraphHelpers.SkillsConfigKey), "skills"),
            Memory = ReadMemory(GetObject(nodeConfig, VoiceAgentGraphHelpers.MemoryConfigKey)),
            Variables = variables,
            Pronunciations = ReadPronunciations(nodeConfig),
            SoundEffects = ReadSoundEffects(nodeConfig),
            ManagerAgentTarget = GetString(nodeConfig, VoiceAgentGraphHelpers.ManagerAgentKey),
        };
    }

    private static string NormalizeFirstSpeaker(string? value) =>
        string.Equals(value?.Trim(), "ai", StringComparison.OrdinalIgnoreCase) ? "ai" : "human";

    private static string NormalizeEngineMode(string? value) =>
        string.IsNullOrWhiteSpace(value) ? "pipeline" : value.Trim().ToLowerInvariant();

    private static string ComposeSystemPrompt(string? goal, string? role, string? instructions)
    {
        var sections = new List<string>();
        if (!string.IsNullOrWhiteSpace(goal))
            sections.Add($"Goal:\n{goal.Trim()}");
        if (!string.IsNullOrWhiteSpace(role))
            sections.Add($"Role:\n{role.Trim()}");
        if (!string.IsNullOrWhiteSpace(instructions))
            sections.Add($"Instructions:\n{instructions.Trim()}");

        sections.Add(SpokenStyleGuidance);
        return string.Join("\n\n", sections);
    }

    private static Dictionary<string, string> ReadVariables(JsonObject nodeConfig)
    {
        var variables = new Dictionary<string, string>(StringComparer.Ordinal);
        if (GetBool(nodeConfig, VoiceAgentGraphHelpers.VariablesEnabledKey) == false)
            return variables;

        var values = GetObject(nodeConfig, VoiceAgentGraphHelpers.VariablesKey);
        if (values is null)
            return variables;

        foreach (var pair in values)
        {
            if (pair.Value is not null)
                variables[pair.Key] = GetStringValue(pair.Value) ?? string.Empty;
        }

        return variables;
    }

    private static string? ResolveVariables(
        JsonObject nodeConfig,
        string? text,
        IReadOnlyDictionary<string, string> variables)
    {
        if (string.IsNullOrEmpty(text) || variables.Count == 0)
            return text;

        return VoiceVariablePattern.Replace(text, match =>
            variables.TryGetValue(match.Groups[1].Value, out var value) ? value : match.Value);
    }

    private static VoiceModelSettingsDto ReadModel(JsonObject? config)
    {
        return new VoiceModelSettingsDto
        {
            Provider = GetString(config, "provider"),
            Model = GetString(config, "model"),
            CredentialName = ReadCredential(config),
            IsByokEnabled = GetBool(config, "is_byok_enabled") == true,
            Temperature = GetDouble(config, "temperature") ?? 1,
            TopP = GetDouble(config, "top_p") ?? 1,
            MaxOutputTokens = GetInt(config, "max_output_tokens"),
            ReasoningEffort = GetString(config, "reasoning_effort"),
        };
    }

    private static VoiceOutputSettingsDto ReadOutput(JsonObject? config)
    {
        return new VoiceOutputSettingsDto
        {
            Language = GetString(config, "language"),
            Voice = GetString(config, "voice"),
            Speed = GetDouble(config, "speed") ?? 1,
        };
    }

    private static List<VoiceToolSettingsDto> ReadTools(JsonArray? config)
    {
        var tools = new List<VoiceToolSettingsDto>();
        if (config is null)
            return tools;

        foreach (var item in config)
        {
            if (item is not JsonObject tool)
                continue;

            var toolName = GetString(tool, "tool");
            if (string.IsNullOrWhiteSpace(toolName))
                continue;

            var actions = new List<VoiceToolActionSettingsDto>();
            if (GetArray(tool, "actions") is JsonArray actionArray)
            {
                foreach (var action in actionArray.OfType<JsonObject>())
                {
                    var actionName = GetString(action, "action");
                    if (string.IsNullOrWhiteSpace(actionName))
                        continue;

                    actions.Add(new VoiceToolActionSettingsDto
                    {
                        Action = actionName,
                        Approval = GetString(action, "approval") ?? "auto",
                    });
                }
            }

            tools.Add(new VoiceToolSettingsDto
            {
                Tool = toolName,
                CredentialName = ReadCredential(tool),
                Actions = actions,
            });
        }

        return tools;
    }

    private static VoiceKnowledgeBaseSettingsDto ReadKnowledgeBase(JsonObject? config)
    {
        var names = config is null ? [] : ReadStringArray(config, "knowledgeBase");
        return new VoiceKnowledgeBaseSettingsDto
        {
            Names = names,
            TopK = names.Count > 0 ? GetInt(config, "numberOfChunks") ?? 5 : 5,
            SourceThreshold = names.Count > 0 ? GetDouble(config, "sourceThreshold") : null,
        };
    }

    private static VoiceMemorySettingsDto ReadMemory(JsonObject? config) => new()
    {
        Provider = GetString(config, "memoryProvider"),
        MaxShortTermTurns = GetInt(config, "maxDataStored"),
    };

    private static List<string> ReadStringArray(JsonObject? config, string key)
    {
        if (GetArray(config, key) is not JsonArray values)
            return [];

        return values
            .Where(value => value is not null)
            .Select(value => value!.ToString())
            .Where(value => !string.IsNullOrWhiteSpace(value))
            .ToList();
    }

    private static List<VoicePronunciationSettingsDto> ReadPronunciations(JsonObject nodeConfig)
    {
        if (GetBool(nodeConfig, VoiceAgentGraphHelpers.PronunciationEnabledKey) != true ||
            GetArray(nodeConfig, VoiceAgentGraphHelpers.PronunciationKey) is not JsonArray values)
            return [];

        return values
            .OfType<JsonObject>()
            .Select(value => new VoicePronunciationSettingsDto
            {
                Term = GetString(value, "term")?.Trim() ?? string.Empty,
                Pronunciation = GetString(value, "pronunciation")?.Trim() ?? string.Empty,
            })
            .Where(value => value.Term.Length > 0 && value.Pronunciation.Length > 0)
            .ToList();
    }

    private static VoiceSoundEffectsSettingsDto? ReadSoundEffects(JsonObject nodeConfig)
    {
        var masterOn = GetBool(nodeConfig, VoiceAgentGraphHelpers.SfxEnabledKey) == true;
        var cueUrl = GetString(nodeConfig, VoiceAgentGraphHelpers.SfxToolCallCueUrlKey);
        var ambienceUrl = GetString(nodeConfig, VoiceAgentGraphHelpers.SfxAmbienceUrlKey);
        var cueOn = GetBool(nodeConfig, VoiceAgentGraphHelpers.SfxToolCallCueEnabledKey) ?? !string.IsNullOrWhiteSpace(cueUrl);
        var ambienceOn = GetBool(nodeConfig, VoiceAgentGraphHelpers.SfxAmbienceEnabledKey) ?? !string.IsNullOrWhiteSpace(ambienceUrl);

        if (!masterOn && string.IsNullOrWhiteSpace(cueUrl) && string.IsNullOrWhiteSpace(ambienceUrl))
            return null;

        return new VoiceSoundEffectsSettingsDto
        {
            Enabled = masterOn,
            ToolCallCueUrl = masterOn && cueOn ? cueUrl : null,
            AmbienceUrl = masterOn && ambienceOn ? ambienceUrl : null,
        };
    }

    private static JsonObject? GetObject(JsonNode? node, string key) =>
        node is JsonObject obj && obj.TryGetPropertyValue(key, out var value) && value is JsonObject nested
            ? nested
            : null;

    private static JsonArray? GetArray(JsonNode? node, string key) =>
        node is JsonObject obj && obj.TryGetPropertyValue(key, out var value) && value is JsonArray array
            ? array
            : null;

    private static string? GetString(JsonNode? node, string key) =>
        node is JsonObject obj && obj.TryGetPropertyValue(key, out var value)
            ? GetStringValue(value)
            : null;

    private static string? GetStringValue(JsonNode? value)
    {
        if (value is null)
            return null;

        if (value is JsonValue jsonValue && jsonValue.TryGetValue<string>(out var stringValue))
            return stringValue;

        return value.ToString();
    }

    private static string? ReadCredential(JsonNode? node)
    {
        var credentialName = GetString(node, "credential_name");
        return !string.IsNullOrWhiteSpace(credentialName) ? credentialName : GetString(node, "credential_id");
    }

    private static bool? GetBool(JsonNode? node, string key)
    {
        var value = node is JsonObject obj && obj.TryGetPropertyValue(key, out var property) ? property : null;
        if (value is JsonValue jsonValue && jsonValue.TryGetValue<bool>(out var booleanValue))
            return booleanValue;

        return bool.TryParse(GetStringValue(value), out var parsed) ? parsed : null;
    }

    private static int? GetInt(JsonNode? node, string key) =>
        int.TryParse(GetString(node, key), NumberStyles.Integer, CultureInfo.InvariantCulture, out var value)
            ? value
            : null;

    private static double? GetDouble(JsonNode? node, string key) =>
        double.TryParse(GetString(node, key), NumberStyles.Float, CultureInfo.InvariantCulture, out var value)
            ? value
            : null;
}
