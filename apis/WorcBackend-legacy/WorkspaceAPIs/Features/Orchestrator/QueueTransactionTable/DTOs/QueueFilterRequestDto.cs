namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a request for filtering queues based on priorities and conditions.
/// </summary>
public class QueueFilterRequestDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the selected queue.
    /// </summary>
    public Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the selected queue.
    /// </summary>
    public string? QueueName { get; set; }

    /// <summary>
    /// Gets or sets the list of queue priorities for sorting the filter results.
    /// </summary>
    public List<QueueSortOrder> QueuePriority { get; set; } = new();

    /// <summary>
    /// Gets or sets the list of conditions that define how to filter the queues.
    /// </summary>
    public List<QueueFilterCondition> Conditions { get; set; } = new();

    /// <summary>
    /// Gets or sets the maximum number of work items to return.
    /// </summary>
    public int Top { get; set; } = 0;

    /// <summary>
    /// Gets or sets the number of work items to skip before returning results.
    /// </summary>
    public int Skip { get; set; } = 0;

    /// <summary>
    /// Gets or sets the status of the work items to filter by.
    /// If null, work items of all statuses are considered.
    /// </summary>
    public QueueTransactionStatusTypesEnum? Status { get; set; }
}

/// <summary>
/// Represents the sorting criteria for a queue, with a field and an order.
/// </summary>
public class QueueSortOrder
{
    /// <summary>
    /// Gets or sets the field by which the queue is sorted.
    /// </summary>
    public required string Field { get; set; }

    /// <summary>
    /// Gets or sets the order (ascending or descending) of the sorting.
    /// </summary>
    public required string OrderBy { get; set; }
}

/// <summary>
/// Represents a condition used to filter queues, based on a field, operator, and value.
/// </summary>
public class QueueFilterCondition
{
    /// <summary>
    /// Gets or sets the field by which the condition is applied.
    /// </summary>
    public required string Field { get; set; }

    /// <summary>
    /// Gets or sets the comparison operator used for the condition (e.g., "=", ">", "<").
    /// </summary>
    public required string ComparisonOperator { get; set; }

    /// <summary>
    /// Gets or sets the value to compare the field with in the condition.
    /// </summary>
    public required string Value { get; set; }
}
