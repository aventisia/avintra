namespace AspNetToolkit.Entities;

/// <summary>
/// Read-only projection of the AccountsDb "UserRoles" many-to-many table.
/// Links AccountUserReadOnly to AccountRoleReadOnly.
/// </summary>
[Table("AspNetUserRoles")]
public class AccountUserRoleReadOnly
{
    public Guid UserId { get; set; }

    public Guid RoleId { get; set; }

    [ForeignKey("UserId")]
    public virtual AccountUserReadOnly? User { get; set; }

    [ForeignKey("RoleId")]
    public virtual AccountRoleReadOnly? Role { get; set; }
}
