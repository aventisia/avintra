namespace WorkspaceAPIs.DTOs;

public class QueueTransactionDto
{
    /// <summary>
    /// Gets or sets the ID of the flow this version is associated with.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the queue.
    /// </summary>
    [StringLength(255)]
    public string? QueueName { get; set; }

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
    public required Guid QueueID { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }
}