namespace AspNetToolkit.Entities;

/// <summary>
/// This entity class is only to read Tenants specific info from the database to validate
/// Tenant existance/activeness/Db config at the time of api request. CurrentTenantService is going to use this
/// </summary>
[Table("Tenants")]
public class TenantReadOnly
{
    /// <summary>
    /// Gets or sets the tenant's primary key in Guid (globally unique identifier) format.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the full name of the tenant. Must be unique. Maximum length is 100 characters.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the expiry date and time of the tenant's account based on the subscription/trial period.
    /// </summary>
    public DateTimeOffset ExpiresOn { get; set; }

    /// <summary>
    /// Gets or sets the database options for the tenant: Shared, Isolated, or DedicatedServer. Maximum length is 15 characters.
    /// By default, "Isolated" will be selected for businesses.
    /// By default, "Shared" will be used for "Individual Users" tenant.
    /// </summary>
    public DatabaseOptionsEnum DbOption { get; set; }

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
    /// Gets or sets a value indicating whether the record is disabled. Use this to mark a record as disabled if it's outdated or no longer required when deletion is not possible.
    /// </summary>
    public bool IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the container name associated with the tenant.
    /// </summary>
    public string ContainerName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether Change Requests are enabled for this tenant.
    /// </summary>
    public bool IsChangeRequestEnabled { get; set; } = false;
}