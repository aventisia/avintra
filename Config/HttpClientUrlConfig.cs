namespace AspNetToolkit.Config;

/// <summary>
/// Configuration settings for http client and urls for.
/// </summary>
public class HttpClientUrlConfig
{
    /// <summary>
    /// ModelStudioApis base url for registering HttpClient with the
    /// </summary>
    public required string ModelStudioApisBaseUrl { get; set; }

    /// <summary>
    /// WorkspaceApis base url for registering HttpClient with the
    /// </summary>
    public required string WorkspaceApisBaseUrl { get; set; }
    
    /// <summary>
    /// AccountsApis base url for registering HttpClient with the
    /// </summary>
    public required string AccountsApisBaseUrl { get; set; }
    
    /// <summary>
    /// LlmPipelineApis base url for registering HttpClient with the
    /// </summary>
    public required string LlmPipelineApisBaseUrl { get; set; }
    
}