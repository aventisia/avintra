namespace AccountsAPIs.Entities;

/// <summary>
/// Represents an integration of an external application within the system.
/// </summary>
public class AppIntegration : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the ID of the tenant that owns this integration.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the app integration. This field is required.
    /// </summary>
    [Required]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets a brief description of the app integration. This field is optional and can contain up to 500 characters.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the app integration is currently connected.
    /// </summary>
    public bool IsConnected { get; set; }

    /// <summary>
    /// Gets or sets the website URL of the app integration, if available. This field is optional and can contain up to 500 characters.
    /// </summary>
    public string? WebsiteUrl { get; set; }

    /// <summary>
    /// Gets or sets the collection of app secrets associated with the app integration.
    /// </summary>
    /// <remarks>
    /// An app integration can have multiple secrets associated with it.
    /// </remarks>
    public ICollection<AppSecret>? AppSecrets { get; set; }
}