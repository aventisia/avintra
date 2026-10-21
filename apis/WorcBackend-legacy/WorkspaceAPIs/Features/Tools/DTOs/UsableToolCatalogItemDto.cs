namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a usable tool together with its enriched operations, for the
/// action-selector catalog payload.
/// </summary>
public class UsableToolCatalogItemDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the tool.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the tool (max 255 chars).
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the brand icon path for platform tools, resolved from the
    /// integration catalog. Null for custom tools and unknown integrations.
    /// </summary>
    public string? Icon { get; set; }

    /// <summary>
    /// Gets or sets the description of the tool.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the optional URL of the icon that represents the tool (max 1000 chars).
    /// Null or empty means the default placeholder icon is used.
    /// </summary>
    [StringLength(1000)]
    public string? IconUrl { get; set; }

    /// <summary>
    /// Gets or sets whether the component is platform-managed or custom.
    /// </summary>
    public ComponentTypeEnum? Type { get; set; }

    /// <summary>
    /// Gets or sets the authentication method required by the tool.
    /// </summary>
    public ToolAuthenticationTypeEnum? AuthenticationType { get; set; }

    /// <summary>
    /// Gets or sets the unique name of the credential associated with the tool.
    /// </summary>
    public string? CredentialName { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tool is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tool has been verified.
    /// </summary>
    public bool IsVerified { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tool is disabled.
    /// </summary>
    public bool IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the enriched operations exposed by the tool.
    /// </summary>
    public List<UsableToolOperationDto> Operations { get; set; } = [];
}