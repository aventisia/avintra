namespace MLModelBuilderAPIs.Config;

public class ExtractViaLLMConfig
{
    public required string LLMPipelineAPI { get; set; }

    public required string LLMPipelineAPIKey { get; set; }

    public required string OllamaAPI { get; set; }

    public required string OllamaAPIKey { get; set; }
}