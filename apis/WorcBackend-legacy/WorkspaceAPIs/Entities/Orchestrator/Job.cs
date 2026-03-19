namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an execution instance of a flow/agent, tracking its execution details, status, and associated logs. This class provides information about the job's lifecycle.
/// </summary>
[Table("worc_Jobs")]
public class Job
{
    /// <summary>
    /// Gets or sets the unique identifier (primary key) for the job record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the primary key of the tenant associated with the job, used for multi-tenant filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the flow or agent this job is associated with.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the job's trigger type (e.g., manual, API, event-based).
    /// </summary>
    public TriggerTypesEnum TriggerType { get; set; } = TriggerTypesEnum.None;

    /// <summary>
    /// Gets or sets the unique identifier of the trigger that initiated the job. This is optional and may be null.
    /// </summary>
    public Guid? RefId { get; set; }

    /// <summary>
    /// Gets or sets the priority of the job (e.g., Normal, High).
    /// </summary>
    public JobPriorityTypesEnum Priority { get; set; } = JobPriorityTypesEnum.Normal;

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution started.
    /// </summary>
    public DateTimeOffset? StartTime { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution completed. This property is null if the job is still running.
    /// </summary>
    public DateTimeOffset? EndTime { get; set; }

    /// <summary>
    /// Gets or sets the number of retries attempted for the job. This value increments if the job is retried due to failure or other reasons.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job (e.g., Running, Completed, Failed, Canceled).
    /// </summary>
    public JobStatusTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the machine where the job is running.
    /// </summary>
    public Guid? MachineId { get; set; }

    /// <summary>
    /// Gets or sets the input arguments for the job in JSON format.
    /// </summary>
    public string? InputArgumentJson { get; set; }

    /// <summary>
    /// Gets or sets the output data produced by the job, stored as a JSON string. Populated when the job completes.
    /// </summary>
    public string? OutputDataJson { get; set; }

    /// <summary>
    /// Gets or sets the logs of node executions within the job's flow/agent, stored as a JSON string.
    /// </summary>
    public string? NodeExecutionLogs { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets a value that indicates whether the flow version is published or unpublished.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets the navigation property to the flow version associated with this job.
    /// </summary>
    public virtual FlowVersion? FlowVersion { get; set; }

    /// <summary>
    /// Gets or sets the navigation property to the flow version associated with this job.
    /// </summary>
    public virtual Machine? Machine { get; set; }

}
