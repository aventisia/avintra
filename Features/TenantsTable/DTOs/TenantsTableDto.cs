namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a tenant.
/// </summary>
public class TenantsTableDto
{
    /// <summary>
    /// Gets or sets the tenant record's primary key.
    /// </summary>
    /// <remarks>
    /// Note: Not making it required because the same DTO is used for insert and update.
    /// </remarks>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique full name of the tenant. Maximum length is 100 characters.
    /// </summary>
    [StringLength(100)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the expiry date and time of the tenant's account based on the subscription/trial period.
    /// </summary>
    public DateTimeOffset? ExpiresOn { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating if single sign-on is enabled for tenant users. The default value is false.
    /// </summary>
    public bool? IsSSOEnabled { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating if login using password is enabled for tenant users. The default value is true.
    /// </summary>
    public bool? IsPwdEnabled { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating if password expiry is enabled for tenant users. The default value is true.
    /// </summary>
    public bool? IsPwdNeverExpiresEnabled { get; set; }

    /// <summary>
    /// Gets or sets the number of days before the tenant user's password expires (only applicable if IsPwdNeverExpiresEnabled is enabled). The default value is 30 days.
    /// </summary>
    public int? DaysBeforePwdExpires { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating if automatic session logout due to inactivity is enabled for tenant users. The default value is true.
    /// </summary>
    public bool? IsIdleSessionTimeoutEnabled { get; set; }

    /// <summary>
    /// Gets or sets the number of minutes after which a user's session will be logged out due to inactivity (only applicable if IsIdleSessionTimeoutEnabled is enabled). The default value is 15 minutes.
    /// </summary>
    public int? IdleSessionTimeoutMinutes { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating if two-factor authentication is enabled for tenant users. The default value is false.
    /// </summary>
    public bool? IsTwoFAEnabled { get; set; }

    /// <summary>
    /// Gets or sets the single sign-on configuration of the tenant.
    /// </summary>
    public string? SSOConfigJson { get; set; }

    /// <summary>
    /// Gets or sets the database options for the tenant: Shared, Isolated, or DedicatedServer. The default value is Shared.
    /// </summary>
    public DatabaseOptionsEnum? DbOption { get; set; }

    /// <summary>
    /// Gets or sets the database user ID required to login to the database. Maximum length is 50 characters.
    /// </summary>
    [StringLength(50)]
    public string? DbUserId { get; set; }

    /// <summary>
    /// Gets or sets the database password required to login to the database. Maximum length is 50 characters.
    /// </summary>
    [StringLength(50)]
    public string? DbPwd { get; set; }

    /// <summary>
    /// Gets or sets the IP address or URL of the database server where the database exists. Maximum length is 500 characters.
    /// </summary>
    [StringLength(500)]
    public string? DbHost { get; set; }

    /// <summary>
    /// Gets or sets the port of the database server.
    /// </summary>
    public long? DbPort { get; set; }

    /// <summary>
    /// Gets or sets the prefix for database names for the Isolated/DedicatedServer options. Maximum length is 10 characters.
    /// </summary>
    [StringLength(10)]
    public string? DbNamePrefix { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the tenant record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the tenant record. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the tenant record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the tenant record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the tenant record was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}