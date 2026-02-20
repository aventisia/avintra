namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an individual transaction for a work item within a queue.
/// </summary>
[Table("worc_WorkItemEvents")]
public class WorkItemEvent : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant, used for global filtering in a multi-tenant architecture.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the event type for this work item event.
    /// </summary>
    public WorkItemEventTypesEnum EventType { get; set; }

    /// <summary>
    /// Gets or sets the data associated with this event, typically stored in a JSON format.
    /// </summary>
    public string? Data { get; set; } // JSON payload

    /// <summary>
    /// Gets or sets the unique identifier for the work item associated with this event.
    /// </summary>
    public required Guid WorkItemId { get; set; }

    /// <summary>
    /// Navigation property for the associated work item, used for eager loading.
    /// </summary>
    [ForeignKey("WorkItemId")]
    public virtual QueueTransaction? WorkItem { get; set; }
}