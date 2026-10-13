namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a vault credential.
/// </summary>
public class VaultCredentialDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the vault credential.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the vault credential (e.g., "Qdrant API Key").
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the vault credential.
    /// </summary>
    public required VaultCredentialTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets an optional description of the vault credential.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the vault credential data in JSON format.
    /// </summary>
    public required object Data { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the vault credential is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets the permission level granted to the user.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the vault credential is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created this vault credential.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this vault credential was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified this vault credential.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this vault credential was last modified.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }

    /// <summary>
    /// Gets or sets the Corsair OAuth connect URL returned after create or update.
    /// </summary>
    [System.Text.Json.Serialization.JsonPropertyName("oauthConnectUrl")]
    public string? OAuthConnectUrl { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the OAuth connection has been completed.
    /// </summary>
    [System.Text.Json.Serialization.JsonPropertyName("oauthConnected")]
    public bool OAuthConnected { get; set; }

    /// <summary>
    /// Gets or sets the current Corsair connection status.
    /// </summary>
    public string? CorsairStatus { get; set; }

    /// <summary>
    /// Gets or sets the reason for the current Corsair connection status.
    /// </summary>
    public string? CorsairStatusReason { get; set; }
}
