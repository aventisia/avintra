namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for the tenant resolver.
/// </summary>
public class TenantResolverConfig
{
    /// <summary>
    /// Gets or sets the list of endpoints that do not require a tenant.
    /// </summary>
    public required List<string> TenantlessEndpoints { get; set; }

    /// <summary>
    /// Gets or sets the list of endpoints that require the tenant ID to be included in the header.
    /// </summary>
    public required List<string> TenantIdInHeaderEndpoints { get; set; }
}