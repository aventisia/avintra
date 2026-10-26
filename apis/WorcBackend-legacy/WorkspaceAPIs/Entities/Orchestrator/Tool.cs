using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a tenant-scoped tool definition.
/// </summary>
[Table("ai_Tools")]
public class Tool : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the record identifier.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant identifier.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the owning space identifier; null means the Central space.
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the deployment environment.
    /// </summary>
    public ConfigureEnvironmentType EnvType { get; set; } = ConfigureEnvironmentType.Dev;

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
    /// Gets or sets the icon URL.
    /// </summary>
    [MaxLength(1000)]
    public string? IconUrl { get; set; }

    /// <summary>
    /// Gets or sets the component type.
    /// </summary>
    public required ComponentTypeEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the base URL of the tool.
    /// </summary>
    [MaxLength(1000)]
    public required string BaseUrl { get; set; }

    /// <summary>
    /// Gets or sets the OpenAPI specification.
    /// </summary>
    public string? OpenApiSpec { get; set; }

    /// <summary>
    /// Gets or sets the parsed OpenAPI schema.
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? ParsedSchema { get; set; }

    /// <summary>
    /// Gets or sets the authentication method.
    /// </summary>
    [MaxLength(50)]
    public ToolAuthenticationTypeEnum? AuthenticationType { get; set; }

    /// <summary>
    /// Gets or sets the associated credential name.
    /// </summary>
    [MaxLength(255)]
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
    /// Gets or sets the creator identifier; null means a platform-seeded tool.
    /// </summary>
    public Guid? CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the creator.
    /// </summary>
    [ForeignKey("CreatedByUserId")]
    public virtual WorkspaceUser? CreatedByUser { get; set; }

    /// <summary>
    /// Gets or sets the creation timestamp.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the last modifier identifier.
    /// </summary>
    public Guid? LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the last modifier.
    /// </summary>
    [ForeignKey("LastModifiedByUserId")]
    public virtual WorkspaceUser? LastModifiedByUser { get; set; }

    /// <summary>
    /// Gets or sets the last modification timestamp.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets whether the record is disabled.
    /// </summary>
    public bool IsDisabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the concurrency version.
    /// </summary>
    [Timestamp]
    public uint Version { get; set; }
}
