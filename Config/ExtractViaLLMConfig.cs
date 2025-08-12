namespace AspNetToolkit.Config;

/// <summary>
/// Configuration settings for extracting data using a Large Language Model (LLM) pipeline.
/// </summary>
public class ExtractViaLLMConfig
{
    /// <summary>
    /// The base URL or endpoint of the external LLM pipeline API.
    /// </summary>
    public required string LLMPipelineAPI { get; set; }

    /// <summary>
    /// The API key used to authenticate with the LLM pipeline API.
    /// </summary>
    public required string LLMPipelineAPIKey { get; set; }

    /// <summary>
    /// The base URL or endpoint of the Ollama API.
    /// </summary>
    public required string OllamaAPI { get; set; }

    /// <summary>
    /// The API key used to authenticate with the Ollama API.
    /// </summary>
    public required string OllamaAPIKey { get; set; }

    /// <summary>
    /// The base URL or endpoint of the Open AI API.
    /// </summary>
    public required string OpenAIAPI { get; set; }

    /// <summary>
    /// The API key used to authenticate with the OpenAI API.
    /// </summary>
    public required string OpenAIAPIKey { get; set; }

    /// <summary>
    /// The model to be used for OpenAI API requests.
    /// </summary>
    public required string OpenAIModel { get; set; }
}
