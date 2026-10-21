namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a credential (e.g., API keys, secrets) stored in the vault for a specific tenant.
/// </summary>
[Table("ws_VaultCredentials")]
public class VaultCredential : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the ID of the tenant that owns this secret.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this secret belongs to.
    /// Null indicates the secret is in the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the deployment environment this secret belongs to.
    /// Combined with tenant/space/name this enforces uniqueness per environment.
    /// </summary>
    public ConfigureEnvironmentType EnvType { get; set; } = ConfigureEnvironmentType.Dev;

    /// <summary>
    /// Gets or sets the name of the secret (e.g., "Qdrant API Key").
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the secret (e.g., "qdrantApi", "openaiApi").
    /// Used to determine the structure of the Data field.
    /// </summary>
    public required VaultCredentialTypesEnum Type { get; set; }

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
    /// Gets or sets a value indicating whether the vault credential is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the vault credential is restricted to its assigned flows.
    /// </summary>
    public bool IsResourceAccessRestricted { get; set; }

    /// <summary>
    /// Gets or sets the encrypted key-value pairs associated with the vault credential.
    /// </summary>
    public ICollection<EncryptedKeyValue>? EncryptedKeyValues { get; set; }
}