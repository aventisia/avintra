using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a tenant-scoped tool definition for platform or custom REST API tools.
/// </summary>
[Table("ws_Tools")]
public class Tool : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant identifier.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this tool belongs to.
    /// Null indicates the tool is in the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the name of the tool.
    /// </summary>
    [MaxLength(255)]
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
    [MaxLength(1000)]
    public required string BaseUrl { get; set; }

    /// <summary>
    /// Gets or sets the OpenAPI specification of the tool.
    /// </summary>
    public string? OpenApiSpec { get; set; }

    /// <summary>
    /// Gets or sets the parsed OpenAPI schema as a JSON document.
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? ParsedSchema { get; set; }

    /// <summary>
    /// Gets or sets the authentication method required by the tool.
    /// </summary>
    [MaxLength(50)]
    public ToolAuthenticationTypeEnum? AuthenticationType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the credential associated with the tool.
    /// </summary>
    public Guid? CredentialId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the tool is available to all users within the tenant.
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
}