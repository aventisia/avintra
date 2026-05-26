namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents detailed information about a space, including metadata.
/// </summary>
public class AppSecretDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the space.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the secret (e.g., "Qdrant API Key").
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the secret (e.g., "qdrantApi", "openaiApi").
    /// Used to determine the structure of the Data field.
    /// </summary>
    public required string Type { get; set; }

    /// <summary>
    /// Gets or sets an optional description of the secret.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the secret data in JSON format. Structure depends on the Type.
    /// </summary>
    public required object Data { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the app secret is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets the permission level granted to the user.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the space is disabled.
    /// Nullable to distinguish between enabled, disabled, or undefined states.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created this space record.
    /// For response use only.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this space record was created.
    /// For response use only.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified this space record.
    /// For response use only.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this space record was last modified.
    /// For response use only.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}