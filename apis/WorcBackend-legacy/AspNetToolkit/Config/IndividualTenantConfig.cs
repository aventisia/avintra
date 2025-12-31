namespace AspNetToolkit.Config;

/// <summary>
/// Contains the default configuration settings for a tenant 
/// in a multi-tenant application.
/// </summary>
public class DefaultTenantConfig
{
    /// <summary>
    /// Gets or sets the unique identifier of the default tenant.
    /// </summary>
    public required Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the default tenant.
    /// </summary>
    public required string TenantName { get; set; }
}