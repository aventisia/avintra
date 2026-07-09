namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents detailed information about a job execution, including its identity, status, timing, and associated flow metadata.
/// Used for displaying job execution records in a structured format.
/// </summary>
public class JobExecutionLogDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the job execution.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job (e.g., Running, Completed, Failed, Canceled).
    /// </summary>
    public JobStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the job execution started.
    /// </summary>
    public DateTimeOffset? StartTime { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the job execution ended. Null if the job is still in progress.
    /// </summary>
    public DateTimeOffset? EndTime { get; set; }

    /// <summary>
    /// Gets the total execution time in seconds. Returns 0 if the job has not completed.
    /// </summary>
    public double Duration
    {
        get
        {
            if (StartTime.HasValue && EndTime.HasValue)
            {
                return (EndTime.Value - StartTime.Value).TotalSeconds;
            }

            return 0;
        }
    }

    /// <summary>
    /// Gets or sets the identifier of the associated flow version.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the flow to the job.
    /// </summary>
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the type of the flow (e.g., regular, conditional, batch).
    /// </summary>
    public FlowTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the version number of the associated flow.
    /// </summary>
    public int VersionNumber { get; set; }
}