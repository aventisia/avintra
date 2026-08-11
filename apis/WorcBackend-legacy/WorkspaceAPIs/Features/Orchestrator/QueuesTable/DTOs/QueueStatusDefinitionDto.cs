namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Defines a custom disposition status for a queue, including its display color and
/// optional route queue. Disposition statuses are always terminal (end) states, so no
/// transition rules are stored. The core system statuses (Pending, InProgress,
/// Completed, Failed) are implicit and are not stored here; only queue-specific custom
/// statuses are persisted.
/// </summary>
public class QueueStatusDefinitionDto
{
    /// <summary>
    /// Gets or sets the internal status value (e.g., "Approved", "Rejected").
    /// This is the value stored on a queue transaction's Status field.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the display label shown to users (e.g., "Approved").
    /// </summary>
    public string? Label { get; set; }

    /// <summary>
    /// Gets or sets the color used to render the status badge (e.g., "#22c55e").
    /// </summary>
    public string? Color { get; set; }

    /// <summary>
    /// Gets or sets the name of the destination queue to which the work item should be
    /// routed when this disposition status is selected. When set, selecting this status
    /// moves the work item to the specified queue (and marks the source item as completed).
    /// </summary>
    public string? RouteQueue { get; set; }
}
