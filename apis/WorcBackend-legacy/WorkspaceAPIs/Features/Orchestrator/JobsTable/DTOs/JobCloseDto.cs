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
    /// Gets or sets the execution logs of nodes within the job's flow, stored as a JSON string.
    /// </summary>
    public string? NodeExecutionLogs { get; set; }

    /// <summary>
    /// Gets or sets the remarks or additional information related to the job closure.
    /// </summary>
    public string? Remarks { get; set; }
}
