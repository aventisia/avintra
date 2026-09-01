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
    /// Gets or sets the stable code of the platform app this role belongs to (lowercase name of PlatformAppsEnum, e.g. "workspace").
    /// Roles are scoped per app so each app's user-management role picker only lists its own roles.
    /// </summary>
    [MaxLength(50)]
    public string AppCode { get; set; } = PlatformAppsEnum.Workspace.ToAppCode();

    /// <summary>
    /// Gets or sets a value indicating whether this instance is the default option.
    /// The default value is <c>false</c>.
    /// </summary>
    public bool IsDefault { get; set; } = false;
    /// <summary>
    /// Gets or sets the virtual property to attach a list of UserRole with Role.
    /// </summary>
    public virtual ICollection<AccountUserRole>? UserRoles { get; set; }

    /// <summary>
    /// Gets or sets the primary key of the tenant to which the role belongs.
    /// </summary>
    /// <remarks>
    /// Note: This has to be nullable as the role can be a system default role and not associated with any tenant.
    /// If the role is associated with a tenant, then this value should be set.
    /// </remarks>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// Gets or sets the tenant associated with the user.
    /// </summary>
    [ForeignKey("TenantId")]
    public virtual Tenant? Tenant { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created the record.
    /// </summary>
    public Guid? CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the AccountUser who created the record.
    /// </summary>
    [ForeignKey("CreatedByUserId")]
    public virtual AccountUser? CreatedByUser { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the role record was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the ID of the user who modified the record.
    /// </summary>
    public Guid? LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the AccountUser who modified the record.
    /// </summary>
    [ForeignKey("LastModifiedByUserId")]
    public virtual AccountUser? LastModifiedByUser { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the role record was last modified.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets a value indicating whether the role record is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the list of role permissions associated with the user's account role.
    /// </summary>
    public virtual ICollection<RolePermission>? RolePermissions { get; set; }

    // /// <summary>
    // /// Gets or sets the list of custom user roles associated with the user.
    // /// </summary>
    // public virtual ICollection<AccountUserRole>? AccountUserRoles { get; set; }
}