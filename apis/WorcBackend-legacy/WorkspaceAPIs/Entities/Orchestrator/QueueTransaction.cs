namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an individual transaction for a work item within a queue.
/// </summary>
[Table("QueueTransactions")]
public class QueueTransaction : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the primary key of the FlowComment record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the tenant, used for global filtering in a multi-tenant architecture.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the current status of the queue transaction (e.g., Pending, In Progress, Completed, Failed).
    /// </summary>
    public QueueTransactionStatusTypesEnum? Status { get; set; }

    /// <summary>
    /// Gets or sets the payload data associated with this transaction, which may include relevant details for processing.
    /// </summary>
    public string? PayloadData { get; set; }

    /// <summary>
    /// Gets or sets the description, validation errors, or other processing notes related to the transaction.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the work item has been modified by the user (true) or agent (false).
    /// </summary>
    public bool IsUserModified { get; set; }

    /// <summary>
    /// Gets or sets the URL of the file associated with this queue transaction.
    /// </summary>
    public string? FileUrl { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the date and time when the record was last modified.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets a value indicating whether the record is disabled. Use this to mark a record as disabled if it's outdated or no longer required when deletion is not possible.
    /// </summary>
    public bool IsDisabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the identifier for the queue to which this transaction belongs.
    /// </summary>
    public required Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets the queue that this transaction is associated with.
    /// </summary>
    [ForeignKey("QueueId")]
    public virtual Queue? Queue { get; set; }

    /// <summary>
    /// Gets or sets the collection of work item events associated with this transaction.
    /// </summary>
    public virtual ICollection<WorkItemEvent>? WorkItemEvents { get; set; }
}
