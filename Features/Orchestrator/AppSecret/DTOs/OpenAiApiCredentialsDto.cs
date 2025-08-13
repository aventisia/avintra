namespace WorkspaceAPIs.DTOs;

/// <summary>
/// DTO for OpenAI API credentials.
/// Contains properties required to authenticate and communicate with the OpenAI API.
/// </summary>
public class OpenAiApiCredentialsDto
{
    /// <summary>
    /// Gets or sets the API key used to authenticate with OpenAI.
    /// </summary>
    public required string ApiKey { get; set; }

    /// <summary>
    /// Gets or sets the optional organization ID associated with the OpenAI account.
    /// </summary>
    public string? OrganizationId { get; set; }

    /// <summary>
    /// Gets or sets the base URL of the OpenAI API.
    /// Defaults to "https://api.openai.com/v1".
    /// </summary>
    public string Url { get; set; } = "https://api.openai.com/v1";
}
