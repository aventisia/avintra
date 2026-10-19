namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a flow granted access to a resource within a tenant.
/// </summary>
[Table("ws_ResourceFlowAccess")]
public class ResourceFlowAccess : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier of the access record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant identifier.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the type of the resource the flow is granted access to.
    /// </summary>
    public ResourceTypeEnum ResourceType { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the resource the flow is granted access to.
    /// </summary>
    public Guid ResourceId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the flow the access is granted to.
    /// </summary>
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the flow the access is granted to.
    /// </summary>
    [ForeignKey(nameof(FlowId))]
    public virtual Flow? Flow { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the user who created the record.
    /// </summary>
    [ForeignKey(nameof(CreatedByUserId))]
    public virtual WorkspaceUser? CreatedByUser { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the row version used for concurrency checks.
    /// </summary>
    [Timestamp]
    public uint Version { get; set; }
}
