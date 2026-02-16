namespace WorkspaceAPIs.Entities;

public class QueueFlowVersion : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// Represents the Queue that this flow is associated with
    /// </summary>
    [ForeignKey("QueueId")]
    public virtual Queue? Queue { get; set; }

    /// <summary>
    /// Represents the ID of the Queue this flow is associated with
    /// </summary>
    public required Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets the access type for the user or role on this queue flow version.
    /// </summary>
    public QueueWorkItemAccessTypesEnum AccessType { get; set; }

    /// <summary>
    /// Represents the flow version associated with this Queue
    /// </summary>
    [ForeignKey("FlowVersionId")]
    public virtual FlowVersion? FlowVersion { get; set; }

    /// <summary>
    /// Represents the ID of the flow version associated with this Queue
    /// </summary>
    public required Guid FlowVersionId { get; set; }
}