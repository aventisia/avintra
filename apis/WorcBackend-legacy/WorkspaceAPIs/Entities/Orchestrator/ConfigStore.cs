namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a configuration item in the system that stores settings or values associated with a tenant.
/// </summary>
[Table("run_ConfigStore")]
public class ConfigStore : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant associated with this configuration item.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this config store belongs to.
    /// Null indicates the config store is in the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the deployment environment this config store belongs to.
    /// Combined with tenant/space/name this enforces uniqueness per environment.
    /// </summary>
    public ConfigureEnvironmentType EnvType { get; set; } = ConfigureEnvironmentType.Dev;

    /// <summary>
    /// Gets or sets the name of the configuration item.
    /// The name should be unique and descriptive of the configuration.
    /// </summary>
    [Required]
    [MaxLength(256)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the config store. Max-500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the type of the configuration item (e.g., Text, Boolean, Credential, JSON).
    /// This defines the data format or structure of the configuration value.
    /// </summary>
    [Required]
    public required ConfigStoreTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the value of the configuration item.
    /// This value could be a string, boolean, or other data type based on the Type.
    /// </summary>
    [Required]
    public required string Value { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the configuration value is encrypted.
    /// If true, the value is encrypted to ensure data security.
    /// </summary>
    public bool IsEncrypted { get; set; }

    /// <summary>
    /// Gets or sets the access level of the configuration item.
    /// Determines whether the configuration is public or private.
    /// </summary>
    [Required]
    public AccessLevelTypesEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the vault is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the config store is restricted to its assigned flows.
    /// </summary>
    public bool IsResourceAccessRestricted { get; set; }
}
