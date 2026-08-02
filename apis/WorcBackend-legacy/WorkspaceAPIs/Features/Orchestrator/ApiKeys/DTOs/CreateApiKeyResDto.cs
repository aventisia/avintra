namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Response payload returned when an API key is created. Inherits the standard API key display fields and adds the plain key returned exactly once.
/// </summary>
public class CreateApiKeyResDto : ApiKeyDto
{
    /// <summary>
    /// Gets or sets the plain API key in the format av-<secrentKey>. This value is returned only on creation and is never stored or returned again.
    /// </summary>
    public string? PlainApiKey { get; set; }
}
