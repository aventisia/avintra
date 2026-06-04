namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a configuration item, including job details such as ID, name, type, value, access level, and encryption status.
/// </summary>
public class VaultDto
{
    /// <summary>
    /// Configuration item ID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Tenant ID associated with the configuration item.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Unique name for the configuration item.
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
    /// Gets or sets a value indicating whether the vault is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets the permission level granted to the user.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Flag indicating if the record is disabled (nullable to distinguish true/false/null).
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Username of the record creator (for response use only).
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Timestamp when the record was created (for response use only).
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Username of the last modifier (for response use only).
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Timestamp when the record was last modified (for response use only).
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
