namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a request to filter queues based on specified priorities and conditions.
/// </summary>
public class QueueWorkItemFilterRequestDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the queue to be filtered.
    /// </summary>
    public Guid QueueId { get; set; }

    /// <summary>
    /// Gets or sets a list of priorities for sorting the filtered queue results.
    /// </summary>
    public List<QueueWorkItemSortOrder> QueuePriority { get; set; } = new();

    /// <summary>
    /// Gets or sets a list of conditions to apply when filtering the queues.
    /// </summary>
    public List<QueueWorkItemFilterCondition> Conditions { get; set; } = new();
}

/// <summary>
/// Defines the sorting criteria for queues, including the field and sort order.
/// </summary>
public class QueueWorkItemSortOrder
{
    /// <summary>
    /// Gets or sets the field by which the queue will be sorted.
    /// </summary>
    public required string Field { get; set; }

    /// <summary>
    /// Gets or sets the sorting order (ascending or descending) for the field.
    /// </summary>
    public required string OrderBy { get; set; }
}

/// <summary>
/// Specifies a condition to filter queues, based on a field, an operator, and a value.
/// </summary>
public class QueueWorkItemFilterCondition
{
    /// <summary>
    /// Gets or sets the field to which the condition is applied.
    /// </summary>
    public required string Field { get; set; }

    /// <summary>
    /// Gets or sets the operator to use in the condition (e.g., "=", ">", "<").
    /// </summary>
    public required string ComparisonOperator { get; set; }

    /// <summary>
    /// Gets or sets the value to compare the field against in the condition.
    /// </summary>
    public required string Value { get; set; }
}
