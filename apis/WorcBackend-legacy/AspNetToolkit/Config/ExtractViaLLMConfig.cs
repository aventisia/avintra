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
}
