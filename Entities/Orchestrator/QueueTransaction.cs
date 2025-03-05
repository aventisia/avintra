namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an individual transaction for a work item within a queue.
/// </summary>
[Table("QueueTransactions")]
public class QueueTransaction : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the tenant, used for global filtering in a multi-tenant architecture.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the current status of the queue transaction (e.g., Pending, In Progress, Completed, Failed).
    /// </summary>
    public QueueTransactionStatusTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the payload data associated with this transaction, which may include relevant details for processing.
    /// </summary>
    public string? PayloadData { get; set; }

    /// <summary>
    /// Gets or sets the identifier for the queue to which this transaction belongs.
    /// </summary>
    public required Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets the queue that this transaction is associated with.
    /// </summary>
    [ForeignKey("QueueId")]
    public virtual Queue? Queue { get; set; }
}
