namespace AccountsAPIs.Entities;

/// <summary>
/// Represents a secret (e.g., API keys, credentials) associated with a specific tenant.
/// </summary>
public class AppSecret : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the ID of the tenant that owns this secret.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the secret (e.g., "Qdrant API Key").
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the secret (e.g., "qdrantApi", "openaiApi").
    /// Used to determine the structure of the Data field.
    /// </summary>
    public required AppSecretTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets an optional description of the secret.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the secret data in JSON format. Structure depends on the Type.
    /// </summary>
    public required string Data { get; set; }

    /// <summary>
    /// Gets or sets the number of times this secret has been used.
    /// </summary>
    public int UsageCount { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the associated app integration.
    /// </summary>
    public Guid? AppIntegrationId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property referencing the related app integration entity.
    /// </summary>
    [ForeignKey("AppIntegrationId")]
    public virtual AppIntegration? AppIntegration { get; set; }
}
