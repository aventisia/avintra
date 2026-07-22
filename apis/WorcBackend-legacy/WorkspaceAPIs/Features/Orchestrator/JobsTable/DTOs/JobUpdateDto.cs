namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to update a job.
/// </summary>
public class JobUpdateDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the job.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the closing status of the job.
    /// </summary>
    public JobStatusEnum? ClosingStatus { get; set; }

    /// <summary>
    /// Gets or sets the remarks or additional information related to the job execution or status.
    /// </summary>
    public string? Remarks { get; set; }

    /// <summary>
    /// Gets or sets the priority level of the job.
    /// </summary>
    public JobPriorityEnum? Priority { get; set; }
}
