namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents an account role in the system.
/// </summary>
public class AccountRoleDto 
{
    /// <summary>
    /// Gets or sets the primary key of the role record. 
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }
    
    /// <summary>
    /// Gets or sets the hierarchy of roles. Lesser the value, higher the role authority.
    /// </summary>
    public int Seq { get; set; }

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
    /// Gets or sets the ID of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who modified the record.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the role record is disabled.
    /// </summary>
    public bool IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the role record. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    [MaxLength(256)]
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the user record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

}