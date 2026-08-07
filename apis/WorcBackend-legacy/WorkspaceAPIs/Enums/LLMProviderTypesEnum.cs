namespace WorkspaceAPIs.Enums;

/// <summary>
/// Enum representing the supported types of external providers for syncing models.
/// </summary>
public enum LLMProviderTypesEnum
{
    /// <summary>
    /// Represents the OpenRouter provider.
    /// </summary>
    [Description("OpenRouter provider")]
    OpenRouter,

    /// <summary>
    /// Represents the Gemini provider.
    /// </summary>
    [Description("Gemini provider")]
    Gemini,

    /// <summary>
    /// Represents the OpenAI provider.
    /// </summary>
    [Description("OpenAI provider")]
    OpenAI,

    /// <summary>
    /// Represents the Anthropic provider.
    /// </summary>
    [Description("Anthropic provider")]
    Anthropic,

    /// <summary>
    /// Represents the ElevenLabs provider.
    /// </summary>
    [Description("ElevenLabs provider")]
    ElevenLabs,

    /// <summary>
    /// Represents the Ollama self-hosted provider.
    /// </summary>
    [Description("Ollama provider")]
    Ollama,

    /// <summary>
    /// Represents the Ollama Cloud provider (static URL https://ollama.com/v1).
    /// </summary>
    [Description("Ollama Cloud provider")]
    OllamaCloud

    /// <summary>
    /// TODO: Add more provider types as they become available.
}
