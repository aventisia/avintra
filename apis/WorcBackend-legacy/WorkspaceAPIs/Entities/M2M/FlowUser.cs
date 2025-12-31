namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a user associated with a specific flow, including support for multi-tenancy via tenant context.
/// </summary>
[Table("FlowUsers")]
public class FlowUser : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant ID, used for filtering in multi-tenant scenarios.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Defines the access type for the user within the flow.
    /// </summary>
    public ProjectUserAccessEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user associated with this flow.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Navigation property that links to the user entity.
    /// </summary>
    [ForeignKey("UserId")]
    public virtual WorkspaceUser? User { get; set; }

    /// <summary>
    /// Gets or sets the ID of the flow that the user is linked to.
    /// </summary>
    public Guid FlowId { get; set; }

    /// <summary>
    /// Navigation property that links to the flow entity.
    /// </summary>
    [ForeignKey("FlowId")]
    public virtual Flow? Flow { get; set; }
}
