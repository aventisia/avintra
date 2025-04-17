namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents an account role in the system.
/// </summary>
public class RoleDto
{
    /// <summary>
    /// Gets or sets the primary key of the role record. 
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the role's full name for just identification of the role. In short, a label for the actual role name. Max-256.
    /// </summary>
    [MaxLength(256)]
    public string? FullName { get; set; }

    /// <summary>
    /// Gets or sets the role's description in detail. Max-1000.
    /// </summary>
    [MaxLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the role record is disabled.
    /// </summary>
    public bool IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this instance is the default option.
    /// The default value is <c>false</c>.
    /// </summary>
    public bool IsDefault { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating number of permission to this role.
    /// </summary>
    public int TotalPermission { get; set; }


    public IEnumerable<AccountPermissionDto>? RolePermissions { get; set; }
}

