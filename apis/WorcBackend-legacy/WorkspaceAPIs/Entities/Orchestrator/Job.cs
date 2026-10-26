namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an execution instance of a flow/agent, tracking its execution details, status, and associated logs. This class provides information about the job's lifecycle.
/// </summary>
[Table("run_Jobs")]
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
    /// <remarks>
    /// We cannot have IMustHaveTenant interface implemented for Job entity, since background service needs to 
    /// manage job in case of time trigger and we will not have the tenant context in that case, so we will just
    /// have TenantId property here and make sure to set the TenantId whenever we create a new job record. 
    /// This will allow us to filter the job records by tenant when we query the database for job management and monitoring. 
    /// TODO: If we can use IgnoreQueryFilter attribute then we can add IMustHaveTenant interface to this entity
    /// </remarks>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this job belongs to.
    /// Null indicates the job is in the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

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
    public JobPriorityEnum Priority { get; set; } = JobPriorityEnum.Normal;

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
    /// Gets or sets the credits consumed for the job execution, if credit tracking is enabled.
    /// </summary>
    public double? CreditsConsumed { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job (e.g., Running, Completed, Failed, Canceled).
    /// </summary>
    public JobStatusEnum Status { get; set; } = JobStatusEnum.Created;

    /// <summary>
    /// Gets or sets the unique identifier of the machine where the job is running.
    /// </summary>
    public Guid? MachineId { get; set; }

    /// <summary>
    /// Gets or sets the input arguments for the job in JSON format.
    /// </summary>
    public string? InputArgumentsJson { get; set; }

    /// <summary>
    /// Gets or sets the output data produced by the job, stored as a JSON string. Populated when the job completes.
    /// </summary>
    public string? OutputDataJson { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets a value that indicates whether the flow version is published or unpublished.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets the identifier or name of the user/machine that executed the job.
    /// </summary>
    public string? ExecutedBy { get; set; }

    /// <summary>
    /// Gets or sets the machine or environment where the job was executed.
    /// Contains the local machine name for desktop execution, or "Web Server" for web server execution.
    /// </summary>
    public string? ExecutedOn { get; set; }

    /// <summary>
    /// Gets or sets additional remarks or execution details related to the job status.
    /// </summary>
    public string? Remark { get; set; }

    /// <summary>
    /// Gets or sets the FlowVersionHistoryId associated with this job.
    /// </summary>
    public Guid? FlowVersionHistoryId { get; set; }

    /// <summary>
    /// Gets or sets the legacy JSON string of node execution logs. Deprecated: use the per-node logs in ws_NodeExecutionLogs.
    /// This property will be removed after the backfill migration is complete.
    /// </summary>
    public string? NodeExecutionLogsLegacy { get; set; }

    /// <summary>
    /// Gets or sets the navigation property to the flow version associated with this job.
    /// </summary>
    [ForeignKey("FlowVersionId")]
    public virtual FlowVersion? FlowVersion { get; set; }

    /// <summary>
    /// Gets or sets the navigation property to the machine associated with this job.
    /// </summary>
    [ForeignKey("MachineId")]
    public virtual Machine? Machine { get; set; }

    /// <summary>
    /// Gets or sets the FlowVersionHistory entity linked to this job via FlowVersionHistoryId.
    /// </summary>
    [ForeignKey("FlowVersionHistoryId")]
    public virtual FlowVersionHistory? FlowVersionHistory { get; set; }

    /// <summary>
    /// Gets or sets the collection of per-node execution logs for the job.
    /// </summary>
    public virtual ICollection<JobNodeExecutionLog> NodeExecutionLogs { get; set; } = new List<JobNodeExecutionLog>();
}
