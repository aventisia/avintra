namespace AspNetToolkit.Config;

/// <summary>
/// Represents configuration settings required for connecting and interacting with the OpenAI API.
/// This class holds the essential information like API endpoint URL and authentication key.
/// </summary>
public class OpenAIConfig
{
    /// <summary>
    /// Gets or sets the base URL or endpoint for making requests to the OpenAI API.
    /// </summary>
    public required string OpenAIApiUrl { get; init; }

    /// <summary>
    /// Gets or sets the API key used to authenticate requests to the OpenAI API.
    /// </summary>
    public required string OpenAIApiKey { get; init; }
}
