namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Status snapshot of a flow-created child job, returned to the waiting Create Job step.
/// </summary>
public class FlowJobStatusDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the job.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job.
    /// </summary>
    public JobStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the output data produced by the job, stored as a JSON string.
    /// </summary>
    public string? OutputDataJson { get; set; }
}
