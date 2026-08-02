namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Request payload for updating an existing API key's metadata. The key hash and plain key cannot be changed directly; create a new key to replace it.
/// </summary>
public class UpdateApiKeyDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the API key to update.
    /// </summary>
    [RequiredGuid]
    public required Guid Id { get; set; }

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

    /// <summary>
    /// Gets or sets a value indicating whether the API key is revoked.
    /// </summary>
    public bool IsRevoked { get; set; }
}
