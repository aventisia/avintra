using AccountsAPIs.AccountApiEnum;

namespace AccountsAPIs.Entities;

/// <summary>
/// Represents a user account in the system.
/// </summary>
[Table("AccountUsers")]
public class AccountUser : IdentityUser<Guid>
{
    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    [MaxLength(50)]
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    [MaxLength(50)]
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the source of the user's avatar (profile pic).
    /// </summary>
    [MaxLength(255)]
    public string? AvatarSrc { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the AccountUser who created the record.
    /// </summary>
    [ForeignKey("CreatedByUserId")]
    public virtual AccountUser? CreatedByUser { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the ID of the user who modified the record.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the AccountUser who modified the record.
    /// </summary>
    [ForeignKey("LastModifiedByUserId")]
    public virtual AccountUser? LastModifiedByUser { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets a value indicating whether the user record is disabled.
    /// </summary>
    public bool IsDisabled { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether the user record is the system default.
    /// </summary>
    /// <remarks>
    /// Note: By default, Any record added via api should set this prop as false and never true. 
    /// Deletion shouldn't be possible via api if its true. 
    /// </remarks>
    public bool IsDefault { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether the system default records are allowed to be modified.
    /// </summary>
    /// <remarks>
    /// Note: By default, any record added via api should set this prop as true.
    /// Modifications shouldn't be possible via api if its false
    /// </remarks>
    public bool IsEditable { get; set; } = true;

    /// <summary>
    /// Gets or sets the date and time when the user's password was last set/reset/updated.
    /// </summary>
    public DateTimeOffset? PwdSetOn { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the user is created in all databases.
    /// </summary>
    /// <remarks>
    /// Note: By default, it should be false. once user is created in Workspace or Internal or more dbs then set it to true
    /// </remarks>
    public bool IsCreatedInOtherDbs { get; set; } = false;

    /// <summary>
    /// Gets or sets the primary key of the tenant to which the user belongs.
    /// </summary>
    /// <remarks>
    /// Note: This has to be nullable as the user can be a system user and not associated with any tenant.
    /// If the user is associated with a tenant, then this value should be set.
    /// </remarks>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// Gets or sets the tenant associated with the user.
    /// </summary>
    [ForeignKey("TenantId")]
    public virtual Tenant? Tenant { get; set; }

    /// <summary>
    /// Gets or sets the list of user roles associated with the user.
    /// </summary>
    public virtual ICollection<AccountUserRole>? UserRoles { get; set; }

    /// <summary>
    /// Gets or sets the date of birth of the user.
    /// </summary>
    public DateTime DateOfBirth { get; set; }

    /// <summary>
    /// Gets or sets the phone number type of the user. either Home or Office
    /// </summary>
    public PhoneNumberType PhoneNumberType { get; set; }

    /// <summary>
    /// Gets or sets the address line 1 of the user. Max-50.
    /// </summary>
    [StringLength(200)]
    public string? AddressLine1 { get; set; }

    /// <summary>
    /// Gets or sets the address line 2 of the user. Max-50.
    /// </summary>
    [StringLength(200)]
    public string? AddressLine2 { get; set; }

    /// <summary>
    /// Gets or sets the gender of the user profile
    /// </summary>
    public GenderType Gender { get; set; } = GenderType.PreferNotToSay;

    /// <summary>
    /// Gets or sets the country of the user. Max-100.
    /// </summary>
    [StringLength(100)]
    public string? Country { get; set; }

    /// <summary>
    /// Gets or sets the state or province of the user. Max-100.
    /// </summary>
    [StringLength(100)]
    public string? StateOrProvince { get; set; }

    /// <summary>
    /// Gets or sets the city of the user. Max-100.
    /// </summary>
    [StringLength(100)]
    public string? City { get; set; }

    /// <summary>
    /// Gets or sets the Zip or postal code of the user. Max-10.
    /// </summary>
    [StringLength(10)]
    public string? ZipOrPostalCode { get; set; }

}