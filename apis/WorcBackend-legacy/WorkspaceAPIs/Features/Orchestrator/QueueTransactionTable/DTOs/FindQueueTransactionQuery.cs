namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents query parameters for filtering and sorting queue transactions.
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
    /// Gets or sets the column to sort the results by (e.g., Status, Date, Priority).
    /// </summary>
    public QueueItemSortSortByFieldsEnum? SortBy { get; set; }

    /// <summary>
    /// Gets or sets the sort direction. True for ascending, false for descending.
    /// </summary>
    public bool IsAscending { get; set; }
}