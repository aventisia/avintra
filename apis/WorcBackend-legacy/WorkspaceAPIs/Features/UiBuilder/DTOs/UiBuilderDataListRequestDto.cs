namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a request to list work items of a queue bound to a custom UI builder project.
/// </summary>
public class UiBuilderDataListRequestDto
{
    /// <summary>
    /// Gets or sets the status to filter by, or null for all statuses.
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of work items to return (default 50, clamped to 1..200).
    /// </summary>
    public int? Top { get; set; }

    /// <summary>
    /// Gets or sets the number of work items to skip (default 0).
    /// </summary>
    public int? Skip { get; set; }

    /// <summary>
    /// Gets or sets the payload conditions applied to the work items.
    /// </summary>
    public List<QueueFilterCondition>? Conditions { get; set; }
}
