namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a user entity that stores user preferences specific to a workspace.
/// </summary>
/// <remarks>
/// This entity should not include common or authentication details, as those will be handled in the AccountUser class in the AccountsAPIs project.
/// </remarks>
[Table("user_WorkspaceUsers")]
public class WorkspaceUser : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the user.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the tenant for multi-tenancy architecture.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the user name. Maximum length: 254 characters.
    /// </summary>
    [MaxLength(254)]
    public required string UserName { get; set; }

    /// <summary>
    /// Gets or sets the user's first name. Maximum length: 50 characters.
    /// </summary>
    [MaxLength(50)]
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name. Maximum length: 50 characters.
    /// </summary>
    [MaxLength(50)]
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the user's avatar (profile picture) source. Maximum length: 255 characters.
    /// </summary>
    [MaxLength(255)]
    public string? AvatarSrc { get; set; }

    /// <summary>
    /// Gets or sets the list of NotificationUsers to manage the many-to-many relation.
    /// </summary>
    public virtual ICollection<NotificationUser>? NotificationUsers { get; set; }

    /// <summary>
    /// Gets or sets the list of Machines to manage the one-to-many relation.
    /// </summary>
    public virtual ICollection<Machine>? Machines { get; set; }

    /// <summary>
    /// Gets or sets the version number used for row versioning. Row versioning helps detect conflicts between concurrent transactions.
    /// </summary>
    /// <remarks>
    /// It is a hidden system column and won't be visible in table's column list.
    /// For more information, see https://www.npgsql.org/efcore/modeling/concurrency.html?tabs=data-annotations
    /// </remarks>
    [Timestamp]
    public uint Version { get; set; }
}
