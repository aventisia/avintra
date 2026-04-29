namespace AccountsAPIs.Entities;

/// <summary>
/// Represents a tenant in the system.
/// </summary>
[Table("Tenants")]
public class Tenant : BaseEntity
{
    /// <summary>
    /// Gets or sets the full name of the tenant. Must be unique. Maximum length is 100 characters.
    /// </summary>
    [MaxLength(100)]
    [DisplayName("Tenant name")]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the expiry date and time of the tenant's account based on the subscription/trial period.
    /// </summary>
    public DateTimeOffset ExpiresOn { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether single sign-on is enabled for the tenant.
    /// If enabled, the authentication pipeline will use the tenant's single sign-on configuration to log in users without a password.
    /// By default, this is disabled.
    /// </summary>
    /// <remarks>
    /// Note: If set to true, a valid single sign-on configuration must be provided, otherwise login will not work.
    /// </remarks>
    public bool IsSSOEnabled { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether users are allowed to login using a password.
    /// If disabled, users cannot log in using their password. By default, this is enabled.
    /// This is mostly required when the tenant wants their users to login using single sign-on only.
    /// </summary>
    public bool IsPwdEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets a value indicating whether password expiration is removed. By default, this is enabled.
    /// </summary>
    public bool IsPwdNeverExpiresEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets the number of days before the password can expire.
    /// This is only required or applicable if IsPwdNeverExpiresEnabled is set to true.
    /// </summary>
    public int DaysBeforePwdExpires { get; set; } = 730;

    /// <summary>
    /// Gets or sets a value indicating whether user sessions will automatically time out after a period of inactivity.
    /// </summary>
    public bool IsIdleSessionTimeoutEnabled { get; set; } = true;

    /// <summary>
    /// Gets or sets the number of minutes before a user session can expire automatically due to inactivity on the app.
    /// This is only required or applicable if IsIdleSessionTimeoutEnabled is set to true.
    /// </summary>
    public int IdleSessionTimeoutMinutes { get; set; } = 10;

    /// <summary>
    /// Gets or sets a value indicating whether an additional verification step is required for all users to log in.
    /// </summary>
    public bool IsTwoFAEnabled { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether the tenant is set as the system default and part of the initial seed.
    /// By default, any record added via the API should set this property as false and never true.
    /// </summary>
    /// <remarks>
    /// Note: Deletion should not be possible via the API if this property is true.
    /// </remarks>
    public bool IsDefault { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether system default records are allowed to be modified.
    /// By default, any record added via the API should set this property as true.
    /// </summary>
    /// <remarks>
    /// Note: Modifications should not be possible via the API if this property is false.
    /// </remarks>
    public bool IsEditable { get; set; } = true;

    /// <summary>
    /// Gets or sets the single sign-on configuration of the tenant.
    /// </summary>
    public string? SSOConfigJson { get; set; }

    /// <summary>
    /// Gets or sets the list of users associated with the tenant.
    /// </summary>
    public virtual ICollection<AccountUser>? Users { get; set; }

    /// <summary>
    /// Gets or sets the database options for the tenant: Shared, Isolated, or DedicatedServer. Maximum length is 15 characters.
    /// By default, "Isolated" will be selected for businesses.
    /// By default, "Shared" will be used for "Individual Users" tenant.
    /// </summary>
    [MaxLength(15)]
    public DatabaseOptionsEnum DbOption { get; set; } = DatabaseOptionsEnum.Isolated;

    /// <summary>
    /// Gets or sets the database credentials for the Isolated/DedicatedServer option.
    /// </summary>
    /// <remarks>
    /// Note: Credentials should be saved in the following format: User ID=USER_ID;Password=PWD;
    /// </remarks>
    public string? DbCredentials { get; set; }

    /// <summary>
    /// Gets or sets the database server IP and port for the DedicatedServer option.
    /// </summary>
    /// <remarks>
    /// Note: IP and port should be saved in the following format: Host=IP_ADDRESS_OR_URL;Port=000;
    /// </remarks>
    public string? DbHost { get; set; }

    /// <summary>
    /// Gets or sets the prefix for database names for the Isolated/DedicatedServer options.
    /// This property will only be updated at the time of tenant creation and should not be modified later.
    /// </summary>
    public string? DbNamePrefix { get; set; }

    /// <summary>
    /// Represents the date when the tenant's settings become effective.
    /// </summary>
    public DateTimeOffset EffectiveDate { get; set; }

    /// <summary>
    /// Gets or sets the resource type associated with the tenant.
    /// </summary>
    public required TenantResourceTypesEnum ResourceType { get; set; }

    /// <summary>
    /// Gets or sets the currency for the pricing plan, defaulting to USD.
    /// </summary>
    public required CurrencyTypesEnum Currency { get; set; }

    /// <summary>
    /// Gets or sets the email domain associated with this tenant.
    /// </summary>
    [StringLength(100)]
    public string Domain { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the number of employees in the organization.
    /// </summary>
    public int NumberOfEmployees { get; set; }

    /// <summary>
    /// Gets or sets the industry in which the organization operates.
    /// </summary>
    public string? Industry { get; set; }

    /// <summary>
    /// Gets or sets the country where the tenant is located.
    /// </summary>
    public CountriesEnum Country { get; set; }

    /// <summary>
    /// Gets or sets the role of the user who registered or manages the tenant.
    /// </summary>
    public string? Role { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay customer ID associated with this tenant.
    /// This is used to manage the tenant's billing and subscriptions through Razorpay.
    /// </summary>
    public string? RazorpayCustomerId { get; set; }

    /// <summary>
    /// Gets or sets the multiplier applied to the tenant's credits for discount or inflation.
    /// 
    /// - Null: No multiplier applied (default, no change in credits).
    /// - 1: No effect on credits (no discount or inflation).
    /// - Values less than 1: Apply a discount (e.g., 0.9 represents a 10% discount).
    /// - Values greater than 1: Apply an inflation (e.g., 1.1 represents a 10% inflation).
    /// </summary>
    [Range(0, 10)]
    public double? Discount { get; set; } = null;

    /// <summary>
    /// Gets or sets the type of the tenant.
    /// </summary>
    public required TenantTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the container name associated with the tenant.
    /// </summary>
    public string ContainerName { get; set; } = string.Empty;

    /// <summary>
    /// Indicates the date for the renewal of the tenant's agreement or settings.
    /// </summary>
    public DateTimeOffset RenewalDate { get; set; }
}