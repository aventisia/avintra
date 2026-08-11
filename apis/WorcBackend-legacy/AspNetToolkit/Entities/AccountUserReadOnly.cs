namespace AspNetToolkit.Entities;

/// <summary>
/// Read-only projection of the AccountsDb "AccountUsers" table.
/// Used by WorkspaceAPIs to resolve notification recipients by role without
/// coupling to the AccountsAPIs project. Do not use for writes.
/// </summary>
[Table("AspNetUsers")]
public class AccountUserReadOnly
{
    [Key]
    public Guid Id { get; set; }

    public string? UserName { get; set; }

    public string? Email { get; set; }

    [MaxLength(50)]
    public string? FirstName { get; set; }

    [MaxLength(50)]
    public string? LastName { get; set; }

    [MaxLength(255)]
    public string? AvatarSrc { get; set; }

    /// <summary>
    /// Nullable because system users (e.g. Super Admin) have no tenant.
    /// </summary>
    public Guid? TenantId { get; set; }

    public bool IsDisabled { get; set; }

    public bool IsDefault { get; set; }

    public virtual ICollection<AccountUserRoleReadOnly>? UserRoles { get; set; }
}
