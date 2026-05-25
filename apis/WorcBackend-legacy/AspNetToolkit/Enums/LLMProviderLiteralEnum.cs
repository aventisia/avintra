namespace AspNetToolkit.Enums;

/// <summary>
/// Centralized provider literal for all schemas used for selecting LLM providers.
/// This enum represents the available LLM providers for interacting with different models.
/// </summary>
public enum LLMProviderLiteral
{
    /// <summary>
    /// OpenAI is a leading AI provider with advanced language models like GPT.
    /// </summary>
    [Description("OpenAI is a leading AI provider with advanced language models like GPT.")]
    OpenAI,

    /// <summary>
    /// Ollama
    /// </summary>
    [Description("Ollama")]
    Ollama,

    /// <summary>
    /// DeepInfra provides AI services with a focus on machine learning and inference.
    /// </summary>
    [Description("DeepInfra provides AI services with a focus on machine learning and inference.")]
    DeepInfra,

    /// <summary>
    /// Gemini is an AI provider offering advanced NLP and machine learning services.
    /// </summary>
    [Description("Gemini is an AI provider offering advanced NLP and machine learning services.")]
    Gemini,

    /// <summary>
    /// OpenRouter is an open-source platform for routing requests to multiple LLM providers.
    /// </summary>
    [Description("OpenRouter is an open-source platform for routing requests to multiple LLM providers.")]
    OpenRouter
}