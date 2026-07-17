namespace WorkspaceAPIs.DTOs;

public class QueueWorkItemDto
{
    /// <summary>
    /// Gets or sets the ID of the flow this version is associated with.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier for the queue to which this transaction belongs.
    /// </summary>
    public Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets the name of the queue.
    /// </summary>
    [StringLength(255)]
    public string? QueueName { get; set; }

    /// <summary>
    /// Gets or sets the current status of the queue transaction (e.g., Pending, In Progress, Completed, Failed).
    /// </summary>
    public QueueTransactionStatusTypesEnum? Status { get; set; }

    /// <summary>
    /// Gets or sets the payload data associated with this transaction, which may include relevant details for processing.
    /// </summary>
    public string? WorkItemData { get; set; }

    /// <summary>
    /// Gets or sets the description, validation errors, or other processing notes related to the transaction.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the work item has been modified by the user (true) or agent (false).
    /// </summary>
    public bool IsUserModified { get; set; }

    /// <summary>
    /// Gets or sets the URLs of the files associated with this queue transaction.
    /// </summary>
    public List<string>? FileUrls { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the source queue transaction from which this transaction was created during a queue routing operation.
    /// This reference is used to trace the origin of the transaction.
    /// </summary>
    public Guid? SourceQueueTransactionId { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}