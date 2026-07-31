namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a tool that can be configured and used within the workspace.
/// </summary>
public class ToolDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the tool.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the tool.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the tool.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets whether the component is platform-managed or custom.
    /// </summary>
    public required ComponentTypeEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the base URL of the tool.
    /// </summary>
    [StringLength(1000)]
    public required string BaseUrl { get; set; }

    /// <summary>
    /// Gets or sets the OpenAPI specification for the tool.
    /// </summary>
    public string? OpenApiSpec { get; set; }

    /// <summary>
    /// Gets or sets the parsed OpenAPI schema as a JSON document.
    /// </summary>
    public JsonDocument? ParsedSchema { get; set; }

    /// <summary>
    /// Gets or sets the authentication method required by the tool.
    /// </summary>
    public ToolAuthenticationTypeEnum? AuthenticationType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the credential associated with the tool.
    /// </summary>
    public Guid? CredentialId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tool is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tool is active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tool has been verified.
    /// </summary>
    public bool IsVerified { get; set; }

    /// <summary>
    /// Gets or sets the access level for the tool.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tool is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who created the tool.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the tool was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who last modified the tool.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the tool was last modified.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}