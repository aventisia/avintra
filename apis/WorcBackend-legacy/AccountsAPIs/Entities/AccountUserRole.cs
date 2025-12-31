namespace AccountsAPIs.Entities;

/// <summary>
/// Entity to store the many-to-many relation between App Users and App Roles.
/// </summary>
[Table("UserRoles")]
public class AccountUserRole : IdentityUserRole<Guid>
{
    /// <summary>
    /// Gets or sets the primary key of the user record.
    /// </summary>
    public override Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the virtual property to attach a User with a UserRole.
    /// </summary>
    [ForeignKey("UserId")]
    public virtual AccountUser? User { get; set; }

    /// <summary>
    /// Gets or sets the primary key of the role record.
    /// </summary>
    public override Guid RoleId { get; set; }

    /// <summary>
    /// Gets or sets the virtual property to attach a Role with a UserRole.
    /// </summary>
    [ForeignKey("RoleId")]
    public virtual AccountRole? Role { get; set; }
}