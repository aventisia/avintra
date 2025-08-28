namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Query parameters to filter and search queue transactions.
/// </summary>
public class FindQueueTransactionQuery
{
    /// <summary>
    /// Gets or sets the unique identifier of the queue.
    /// </summary>
    public Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets the optional name of the queue.
    /// </summary>
    public string? QueueName { get; set; }

    /// <summary>
    /// Gets or sets the optional status to filter queue transactions (e.g., Pending, In Progress, Completed, Failed).
    /// </summary>
    public QueueTransactionStatusTypesEnum? Status { get; set; }

    /// <summary>
    /// Gets or sets the optional creation date to filter queue transactions.
    /// </summary>
    public DateTimeOffset? Date { get; set; }

    /// <summary>
    /// Gets or sets the optional priority to filter queue transactions.
    /// </summary>
    public int? Priority { get; set; }
}