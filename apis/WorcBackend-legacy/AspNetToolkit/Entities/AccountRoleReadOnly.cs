namespace AspNetToolkit.Entities;

/// <summary>
/// Read-only projection of the AccountsDb "Roles" table.
/// Used by WorkspaceAPIs to resolve notification recipients by role name.
/// </summary>
[Table("AspNetRoles")]
public class AccountRoleReadOnly
{
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// The role code, e.g. "SA", "TA", "OM", "TD", "TU".
    /// </summary>
    public string? Name { get; set; }

    public int Seq { get; set; }

    [MaxLength(256)]
    public string? FullName { get; set; }

    /// <summary>
    /// Nullable because system roles (e.g. SA) have no tenant.
    /// </summary>
    public Guid? TenantId { get; set; }

    public virtual ICollection<AccountUserRoleReadOnly>? UserRoles { get; set; }
}
