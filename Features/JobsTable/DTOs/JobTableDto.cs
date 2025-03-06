namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the data transfer object (DTO) for a job execution instance, used to display job details in a table format.
/// This includes job identification, flow name, machine name, status, execution time, and logs.
/// </summary>
public class JobTableDto
{
    /// <summary>
    /// Gets or sets Id of the machine flow.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets Id of the tenant.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets Id of the flow version
    /// </summary>
    [RequiredGuid]
    public required Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the number of retries attempted for the job. 
    /// This value will increment if the job is retried due to failure or other reasons.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow/agent associated with the job.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job, such as Running, Completed, Failed, or Canceled.
    /// </summary>
    public JobStatusTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the start time of the job execution.
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// Gets or sets the end time of the job execution. This is null if the job is still running.
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Gets or sets the duration of the job execution. It represents the time between the start and end times.
    /// </summary>
    public TimeSpan? Duration { get; set; }

    /// <summary>
    /// Gets or sets the execution logs associated with the job. These logs can provide information on job execution,
    /// errors, or any other relevant details. It can hold log data in various formats (such as string or JSON).
    /// </summary>
    public string? ExecutionLogs { get; set; } // Can hold the log data

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// This property is nullable to differentiate between true, false, and null.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the user record. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the user record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}