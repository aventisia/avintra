namespace WorkspaceAPIs.Features.VoiceSessions.DTOs;

/// <summary>
/// Safe, resolved settings for one VoiceAgent session.
/// </summary>
public sealed class VoiceAgentSettingsDto
{
    /// <summary>The flow version that owns the settings.</summary>
    [JsonPropertyName("flowVersionId")]
    public Guid FlowVersionId { get; init; }

    /// <summary>The parent flow identifier.</summary>
    [JsonPropertyName("flowId")]
    public Guid FlowId { get; init; }

    /// <summary>The human-readable agent name.</summary>
    [JsonPropertyName("agentName")]
    public string AgentName { get; init; } = string.Empty;

    /// <summary>The configured engine mode.</summary>
    [JsonPropertyName("engineMode")]
    public string EngineMode { get; init; } = "pipeline";

    /// <summary>The normalized speaker that starts the conversation.</summary>
    [JsonPropertyName("firstSpeaker")]
    public string FirstSpeaker { get; init; } = "human";

    /// <summary>The resolved introduction for an AI-first session.</summary>
    [JsonPropertyName("introduction")]
    public string? Introduction { get; init; }

    /// <summary>The resolved language-model configuration.</summary>
    [JsonPropertyName("llm")]
    public VoiceModelSettingsDto Llm { get; init; } = new();

    /// <summary>The resolved speech-to-text configuration.</summary>
    [JsonPropertyName("stt")]
    public VoiceModelSettingsDto Stt { get; init; } = new();

    /// <summary>The resolved text-to-speech model configuration.</summary>
    [JsonPropertyName("tts")]
    public VoiceModelSettingsDto Tts { get; init; } = new();

    /// <summary>The resolved realtime model configuration reserved for a later phase.</summary>
    [JsonPropertyName("realtime")]
    public VoiceModelSettingsDto Realtime { get; init; } = new();

    /// <summary>The resolved text-to-speech voice settings.</summary>
    [JsonPropertyName("ttsVoice")]
    public VoiceOutputSettingsDto TtsVoice { get; init; } = new();

    /// <summary>The resolved persona and system prompt.</summary>
    [JsonPropertyName("persona")]
    public VoicePersonaSettingsDto Persona { get; init; } = new();

    /// <summary>The fixed spoken-style guidance included in the system prompt.</summary>
    [JsonPropertyName("spokenStyleGuidance")]
    public string SpokenStyleGuidance { get; init; } = string.Empty;

    /// <summary>The configured tools and their allowed actions.</summary>
    [JsonPropertyName("tools")]
    public List<VoiceToolSettingsDto> Tools { get; init; } = [];

    /// <summary>The knowledge-base retrieval settings.</summary>
    [JsonPropertyName("knowledgeBase")]
    public VoiceKnowledgeBaseSettingsDto KnowledgeBase { get; init; } = new();

    /// <summary>The configured skill names.</summary>
    [JsonPropertyName("skills")]
    public List<string> Skills { get; init; } = [];

    /// <summary>The configured memory settings.</summary>
    [JsonPropertyName("memory")]
    public VoiceMemorySettingsDto Memory { get; init; } = new();

    /// <summary>The variable defaults used for template substitution.</summary>
    [JsonPropertyName("variables")]
    public Dictionary<string, string> Variables { get; init; } = new(StringComparer.Ordinal);

    /// <summary>The pronunciation aliases to apply before speech synthesis.</summary>
    [JsonPropertyName("pronunciations")]
    public List<VoicePronunciationSettingsDto> Pronunciations { get; init; } = [];

    /// <summary>The optional sound-effects settings.</summary>
    [JsonPropertyName("soundEffects")]
    public VoiceSoundEffectsSettingsDto? SoundEffects { get; init; }

    /// <summary>The optional manager-agent reference retained for compatibility.</summary>
    [JsonPropertyName("managerAgentTarget")]
    public string? ManagerAgentTarget { get; init; }
}

/// <summary>Provider and model settings for one voice pipeline component.</summary>
public sealed class VoiceModelSettingsDto
{
    /// <summary>The provider name.</summary>
    [JsonPropertyName("provider")]
    public string? Provider { get; init; }

    /// <summary>The provider model name.</summary>
    [JsonPropertyName("model")]
    public string? Model { get; init; }

    /// <summary>The credential reference name, never the credential secret.</summary>
    [JsonPropertyName("credentialName")]
    public string? CredentialName { get; init; }

    /// <summary>Whether the referenced credential is caller-supplied.</summary>
    [JsonPropertyName("isByokEnabled")]
    public bool IsByokEnabled { get; init; }

    /// <summary>The sampling temperature.</summary>
    [JsonPropertyName("temperature")]
    public double Temperature { get; init; } = 1;

    /// <summary>The nucleus sampling value.</summary>
    [JsonPropertyName("topP")]
    public double TopP { get; init; } = 1;

    /// <summary>The optional maximum output token count.</summary>
    [JsonPropertyName("maxOutputTokens")]
    public int? MaxOutputTokens { get; init; }

    /// <summary>The optional reasoning effort.</summary>
    [JsonPropertyName("reasoningEffort")]
    public string? ReasoningEffort { get; init; }
}

/// <summary>Text-to-speech language, voice, and speed settings.</summary>
public sealed class VoiceOutputSettingsDto
{
    /// <summary>The BCP-47 or provider language value.</summary>
    [JsonPropertyName("language")]
    public string? Language { get; init; }

    /// <summary>The provider voice name.</summary>
    [JsonPropertyName("voice")]
    public string? Voice { get; init; }

    /// <summary>The speech speed multiplier.</summary>
    [JsonPropertyName("speed")]
    public double Speed { get; init; } = 1;
}

/// <summary>Resolved VoiceAgent persona content.</summary>
public sealed class VoicePersonaSettingsDto
{
    /// <summary>The resolved goal.</summary>
    [JsonPropertyName("goal")]
    public string? Goal { get; init; }

    /// <summary>The resolved role.</summary>
    [JsonPropertyName("role")]
    public string? Role { get; init; }

    /// <summary>The resolved instructions.</summary>
    [JsonPropertyName("instructions")]
    public string? Instructions { get; init; }

    /// <summary>The composed system prompt.</summary>
    [JsonPropertyName("systemPrompt")]
    public string SystemPrompt { get; init; } = string.Empty;
}

/// <summary>One configured tool and its action approval modes.</summary>
public sealed class VoiceToolSettingsDto
{
    /// <summary>The tool name.</summary>
    [JsonPropertyName("tool")]
    public string? Tool { get; init; }

    /// <summary>The credential reference name.</summary>
    [JsonPropertyName("credentialName")]
    public string? CredentialName { get; init; }

    /// <summary>The permitted actions.</summary>
    [JsonPropertyName("actions")]
    public List<VoiceToolActionSettingsDto> Actions { get; init; } = [];
}

/// <summary>One tool action and its approval mode.</summary>
public sealed class VoiceToolActionSettingsDto
{
    /// <summary>The action name.</summary>
    [JsonPropertyName("action")]
    public string? Action { get; init; }

    /// <summary>The configured approval mode.</summary>
    [JsonPropertyName("approval")]
    public string Approval { get; init; } = "auto";
}

/// <summary>Knowledge-base retrieval settings.</summary>
public sealed class VoiceKnowledgeBaseSettingsDto
{
    /// <summary>The selected knowledge-base names.</summary>
    [JsonPropertyName("names")]
    public List<string> Names { get; init; } = [];

    /// <summary>The configured maximum chunk count.</summary>
    [JsonPropertyName("topK")]
    public int TopK { get; init; } = 5;

    /// <summary>The optional source similarity threshold.</summary>
    [JsonPropertyName("sourceThreshold")]
    public double? SourceThreshold { get; init; }
}

/// <summary>VoiceAgent memory settings.</summary>
public sealed class VoiceMemorySettingsDto
{
    /// <summary>The configured memory provider.</summary>
    [JsonPropertyName("provider")]
    public string? Provider { get; init; }

    /// <summary>The maximum number of short-term turns.</summary>
    [JsonPropertyName("maxShortTermTurns")]
    public int? MaxShortTermTurns { get; init; }
}

/// <summary>One pronunciation replacement.</summary>
public sealed class VoicePronunciationSettingsDto
{
    /// <summary>The written term.</summary>
    [JsonPropertyName("term")]
    public string Term { get; init; } = string.Empty;

    /// <summary>The spoken pronunciation.</summary>
    [JsonPropertyName("pronunciation")]
    public string Pronunciation { get; init; } = string.Empty;
}

/// <summary>Voice sound-effects passthrough settings.</summary>
public sealed class VoiceSoundEffectsSettingsDto
{
    /// <summary>Whether sound effects are enabled.</summary>
    [JsonPropertyName("enabled")]
    public bool Enabled { get; init; }

    /// <summary>The optional tool-call cue URL.</summary>
    [JsonPropertyName("toolCallCueUrl")]
    public string? ToolCallCueUrl { get; init; }

    /// <summary>The optional ambience URL.</summary>
    [JsonPropertyName("ambienceUrl")]
    public string? AmbienceUrl { get; init; }
}
