namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a platform tool enabled for a specific tenant.
/// </summary>
[Table("ai_TenantPlatformTools")]
public class TenantPlatformTool : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the record identifier.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant ID, used for filtering in multi-tenant scenarios.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the platform tool enabled for the tenant.
    /// </summary>
    public Guid PlatformToolId { get; set; }

    /// <summary>
    /// Navigation property that links to the platform tool entity.
    /// </summary>
    [ForeignKey("PlatformToolId")]
    public virtual PlatformTool? PlatformTool { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

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
    /// Gets or sets the concurrency version.
    /// </summary>
    [Timestamp]
    public uint Version { get; set; }
}