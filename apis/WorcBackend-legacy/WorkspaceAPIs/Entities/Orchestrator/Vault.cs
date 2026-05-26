namespace WorkspaceAPIs.Entities;

/// <summary>
/// TODO: Need to remove if AppSecret is there
/// Represents a configuration item within the system that holds settings or values related to a tenant.
/// </summary>
[Table("Vaults")]
public class Vault : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant associated with this configuration item.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the configuration item.
    /// This name must be unique and should clearly describe the configuration.
    /// </summary>
    [Required]
    [MaxLength(256)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the vault. Max-500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the encrypted username associated with this configuration item.
    /// This value must be encrypted to ensure data security.
    /// </summary>
    [Required]
    [MaxLength(256)]
    public required string Username { get; set; }

    /// <summary>
    /// Gets or sets the encrypted password associated with this configuration item.
    /// This value must be encrypted to ensure data security.
    /// </summary>
    [Required]
    [MaxLength(256)]
    public required string Password { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the vaault is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }
}