namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the detailed information about a job execution, including the job's unique ID, status, execution time, and related flow data.
/// This DTO is used to display job details in a structured table format.
/// </summary>
public class JobExecutionDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the job execution.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job (e.g., Running, Completed, Failed, Canceled).
    /// </summary>
    public JobStatusEnum Status { get; set; } = JobStatusEnum.Running;

    /// <summary>
    /// Gets or sets the identifier for the flow version associated with this job execution.
    /// </summary>
    public Guid? FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the machine on which the job is being executed.
    /// This can be null if no machine is assigned to the job.
    /// </summary>
    public Guid? MachineId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the operating system on the machine where the job is running.
    /// This can be null if the OS is not specified.
    /// </summary>
    public string? OsId { get; set; }
}
