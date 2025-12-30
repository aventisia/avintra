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
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the instance.
    /// </summary>
    [Required]
    public Guid InstanceId { get; set; }

    /// <summary>
    /// Gets or sets the type of the instance (e.g., "Production", "Test").
    /// </summary>
    [Required]
    public required string Type { get; set; }

    /// <summary>
    /// Gets or sets the version of the instance or its associated software.
    /// </summary>
    [Required]
    public required string Version { get; set; }
}