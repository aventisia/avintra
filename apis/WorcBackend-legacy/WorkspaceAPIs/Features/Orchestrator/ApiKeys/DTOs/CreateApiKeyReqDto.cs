namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Request payload for creating a new API key. The plain key is generated server-side and returned only once in the response.
/// </summary>
public class CreateApiKeyReqDto
{
    /// <summary>
    /// Gets or sets the human-readable name of the API key (max length 255).
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the optional expiration date and time of the API key.
    /// </summary>
    public DateTimeOffset? ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the optional permissions associated with the API key.
    /// </summary>
    public ApiKeyPermissions? Permissions { get; set; }
}
