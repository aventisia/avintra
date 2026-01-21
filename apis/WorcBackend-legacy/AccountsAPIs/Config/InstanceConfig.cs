namespace AccountsAPIs.Config;

/// <summary>
/// Represents the configuration settings for an instance, including tenant, instance ID, type, and version.
/// </summary>
public class InstanceConfig
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant associated with the instance.
    /// </summary>
    [Required]
    public required string TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the tenant associated with the instance.
    /// </summary>
    [Required]
    public required string TenantName { get; set; }

    /// <summary>
    /// Gets or sets the type of tenant (e.g., "Commercial", "Enterprise", etc.).
    /// </summary>
    [Required]
    public required string TenantType { get; set; }

    /// <summary>
    /// Gets or sets the unique key for the instance.
    /// </summary>
    [Required]
    public required string InstanceKey { get; set; }

    /// <summary>
    /// Gets or sets the type of the instance (e.g., "Production", "Test").
    /// </summary>
    [Required]
    public required string InstanceType { get; set; }

    /// <summary>
    /// Gets or sets the app version of the instance or its associated software.
    /// </summary>
    [Required]
    public required string PlatformVersion { get; set; }
}