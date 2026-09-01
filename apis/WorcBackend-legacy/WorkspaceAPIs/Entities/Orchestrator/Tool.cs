using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a tenant-scoped tool definition for platform or custom REST API tools.
/// </summary>
[Table("ws_Tools")]
public class Tool : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the record's primary key in Guid (globally unique identifier) format.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

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
    /// Gets or sets the deployment environment this tool belongs to.
    /// Combined with tenant/space/name this enforces uniqueness per environment.
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
    /// Gets or sets the unique name of the credential associated with the tool.
    /// </summary>
    [MaxLength(255)]
    public string? CredentialName { get; set; }

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

    /// <summary>
    /// Gets or sets the ID of the user who created the record.
    /// Null indicates the tool was created by the platform (e.g. seeded platform tools).
    /// </summary>
    public Guid? CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the WorkspaceUser who created the record.
    /// </summary>
    [ForeignKey("CreatedByUserId")]
    public virtual WorkspaceUser? CreatedByUser { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the ID of the user who modified the record last.
    /// Null indicates the tool was last modified by the platform (e.g. seeded platform tools).
    /// </summary>
    public Guid? LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the WorkspaceUser who modified the record last.
    /// </summary>
    [ForeignKey("LastModifiedByUserId")]
    public virtual WorkspaceUser? LastModifiedByUser { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was last modified.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets a value indicating whether the record is disabled. Use this to mark a record as disabled if it's outdated or no longer required when deletion is not possible.
    /// </summary>
    public bool IsDisabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the version number used for row versioning. Row versioning helps detect conflicts between concurrent transactions.
    /// </summary>
    /// <remarks>
    /// It is a hidden system column and won't be visible in table's column list.
    /// For more information, see https://www.npgsql.org/efcore/modeling/concurrency.html?tabs=data-annotations
    /// </remarks>
    [Timestamp]
    public uint Version { get; set; }
}