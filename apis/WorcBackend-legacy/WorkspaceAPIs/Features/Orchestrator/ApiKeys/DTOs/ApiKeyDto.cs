namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Response data for an API key, returned by list, get-by-id, and update endpoints.
/// The plain key is never returned; only the masked KeyPrefix is exposed.
/// </summary>
public class ApiKeyDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the API key.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the human-readable name of the API key (max length 255).
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the masked prefix of the API key shown in the UI (e.g., "av-3q1...").
    /// </summary>
    public string? KeyPrefix { get; set; }

    /// <summary>
    /// Gets or sets the optional expiration date and time of the API key.
    /// </summary>
    public DateTimeOffset? ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the API key was last used.
    /// </summary>
    public DateTimeOffset? LastUsedAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the API key is revoked.
    /// </summary>
    public bool IsRevoked { get; set; }

    /// <summary>
    /// Gets or sets the optional permissions associated with the API key.
    /// </summary>
    public ApiKeyPermissions? Permissions { get; set; }

    /// <summary>
    /// Gets or sets the full name of the user who created the API key.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the API key was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the full name of the user who last modified the API key.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the API key was last modified.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
