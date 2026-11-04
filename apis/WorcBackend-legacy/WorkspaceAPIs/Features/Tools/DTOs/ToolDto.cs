namespace WorkspaceAPIs.DTOs;

/// <summary>
    /// Represents a workspace tool.
/// </summary>
public class ToolDto
{
    /// <summary>
    /// Gets or sets the tool identifier.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tool name (max 255 chars).
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the tool description.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the icon URL (max 1000 chars).
    /// </summary>
    [StringLength(1000)]
    public string? IconUrl { get; set; }

    /// <summary>
    /// Gets or sets the component type.
    /// </summary>
    public ComponentTypeEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the base URL (max 1000 chars).
    /// </summary>
    [StringLength(1000)]
    public required string BaseUrl { get; set; }

    /// <summary>
    /// Gets or sets the OpenAPI specification.
    /// </summary>
    public string? OpenApiSpec { get; set; }

    /// <summary>
    /// Gets or sets the parsed OpenAPI schema.
    /// </summary>
    public JsonDocument? ParsedSchema { get; set; }

    /// <summary>
    /// Gets or sets the manually authored operations.
    /// </summary>
    public List<ManualToolOperationDto>? ManualOperations { get; set; }

    /// <summary>
    /// Gets or sets the authentication method.
    /// </summary>
    public ToolAuthenticationTypeEnum? AuthenticationType { get; set; }

    /// <summary>
    /// Gets or sets the associated credential name.
    /// </summary>
    public string? CredentialName { get; set; }

    /// <summary>
    /// Gets or sets whether the tool is tenant-wide.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets whether the tool is restricted to its assigned flows.
    /// </summary>
    public bool IsResourceAccessRestricted { get; set; }

    /// <summary>
    /// Gets or sets whether the tool is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets whether the tool is verified.
    /// </summary>
    public bool IsVerified { get; set; }

    /// <summary>
    /// Gets or sets the tool access level.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets whether the tool is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets whether this platform tool is one of the curated popular tools.
    /// </summary>
    public bool IsPopular { get; set; }

    /// <summary>
    /// Gets or sets the creator identifier.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the creation timestamp.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the last modifier identifier.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the last modification timestamp.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
