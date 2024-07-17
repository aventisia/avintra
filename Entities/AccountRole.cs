namespace AccountsAPIs.Entities;

/// <summary>
/// Represents an account role in the system.
/// </summary>
[Table("Roles")]
public class AccountRole : IdentityRole<Guid>
{
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
    /// Gets or sets the virtual property to attach a list of UserRole with Role.
    /// </summary>
    public virtual ICollection<AccountUserRole>? UserRoles { get; set; }
}