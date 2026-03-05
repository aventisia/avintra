namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data transfer object (DTO) for representing job execution details, used for displaying job information in a tabular format.
/// It includes essential job attributes such as identification, flow name, machine name, status, execution time, and logs.
/// </summary>
public class JobTableDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the job.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow or agent associated with the job.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the flow or agent linked to the job.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the trigger type for the job (e.g., manual, API, event-based).
    /// </summary>
    public TriggerTypesEnum TriggerType { get; set; } = TriggerTypesEnum.ManualTrigger;

    /// <summary>
    /// Gets or sets the identifier of the trigger that initiated the job. This is optional and may be null.
    /// </summary>
    public Guid? RefId { get; set; }

    /// <summary>
    /// Gets or sets the priority level of the job (e.g., Normal, High).
    /// </summary>
    public JobPriorityTypesEnum Priority { get; set; } = JobPriorityTypesEnum.Normal;

    /// <summary>
    /// Gets or sets the timestamp when the job execution started.
    /// </summary>
    public DateTimeOffset? StartTime { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the job execution finished. This is null if the job is still in progress.
    /// </summary>
    public DateTimeOffset? EndTime { get; set; }

    /// <summary>
    /// Gets the job execution duration in seconds, calculated as the difference between StartTime and EndTime.
    /// Returns 0 if the job is still running.
    /// </summary>
    public double Duration
    {
        get
        {
            if (StartTime.HasValue && EndTime.HasValue)
                return (EndTime.Value - StartTime.Value).TotalSeconds;
            return 0;
        }
    }

    /// <summary>
    /// Gets or sets the number of retries attempted for the job.
    /// This value increases if the job is retried due to failure or other reasons.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job (e.g., Running, Completed, Failed, Canceled).
    /// </summary>
    public JobStatusTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the machine where the job is being executed.
    /// </summary>
    public Guid? MachineId { get; set; }

    /// <summary>
    /// Gets or sets the input arguments for the job in JSON format.
    /// </summary>
    public string? InputArguments { get; set; }

    /// <summary>
    /// Gets or sets the logs of node executions within the job's flow/agent, stored as a JSON string.
    /// </summary>
    public string? NodeExecutionLogs { get; set; }

    /// <summary>
    /// Gets or sets the identifier that uniquely represents the operating system.
    /// </summary>
    public string? OSId { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets a value that indicates whether the flow version is published or unpublished.
    /// </summary>
    public bool IsPublished { get; set; }
}