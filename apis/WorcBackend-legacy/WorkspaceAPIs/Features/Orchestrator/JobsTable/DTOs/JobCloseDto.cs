namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to close a job in a terminal status.
/// The endpoint records the end time, node execution logs, and tracks consumed credits.
/// </summary>
public class JobCloseDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the job.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the terminal closing status of the job.
    /// </summary>
    public JobStatusEnum ClosingStatus { get; set; }

    /// <summary>
    /// Gets or sets the collection of per-node execution logs for the job.
    /// </summary>
    public List<NodeExecutionLogDto> NodeExecutionLogs { get; set; } = [];

    /// <summary>
    /// Gets or sets the remarks or additional information related to the job closure.
    /// </summary>
    public string? Remarks { get; set; }
}
