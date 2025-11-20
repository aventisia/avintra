namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an execution instance of a flow/agent, tracking its execution details,
/// status, and associated logs. This class provides information about the job's lifecycle, 
/// </summary>
[Table("Jobs")]
public class Job : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the primary key of the tenant associated with the job, used for multi-tenant filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the flow or agent this job is associated with.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job, which can be one of the following values: 
    /// Running, Completed, Failed, or Canceled.
    /// </summary>
    public JobStatusTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the number of retries attempted for the job. 
    /// This value will increment if the job is retried due to failure or other reasons.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution started.
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution completed. 
    /// This property is null if the job is still running.
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Gets or sets the duration of the job execution. It is calculated as the difference 
    /// between StartTime and EndTime.
    /// </summary>
    public TimeSpan? Duration { get; set; }

    /// <summary>
    /// Gets or sets the execution logs associated with the job. These logs may be stored as a string 
    /// or in JSON format and contain information about the job's execution steps, errors, or outputs.
    /// </summary>
    public string? ExecutionLogs { get; set; }

    /// <summary>
    /// Navigation property for the associated flow. Represents the flow/agent that triggered this job.
    /// </summary>
    public virtual FlowVersion? FlowVersion { get; set; }
}
namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an execution instance of a flow/agent, tracking its execution details,
/// status, and associated logs. This class provides information about the job's lifecycle, 
/// </summary>
[Table("Jobs")]
public class Job : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the primary key of the tenant associated with the job, used for multi-tenant filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the flow or agent this job is associated with.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job, which can be one of the following values: 
    /// Running, Completed, Failed, or Canceled.
    /// </summary>
    public JobStatusTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the number of retries attempted for the job. 
    /// This value will increment if the job is retried due to failure or other reasons.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution started.
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution completed. 
    /// This property is null if the job is still running.
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Gets or sets the duration of the job execution. It is calculated as the difference 
    /// between StartTime and EndTime.
    /// </summary>
    public TimeSpan? Duration { get; set; }

    /// <summary>
    /// Gets or sets the execution logs associated with the job. These logs may be stored as a string 
    /// or in JSON format and contain information about the job's execution steps, errors, or outputs.
    /// </summary>
    public string? ExecutionLogs { get; set; }

    /// <summary>
    /// Navigation property for the associated flow. Represents the flow/agent that triggered this job.
    /// </summary>
    public virtual FlowVersion? FlowVersion { get; set; }
}
namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an execution instance of a flow/agent, tracking its execution details,
/// status, and associated logs. This class provides information about the job's lifecycle, 
/// </summary>
[Table("Jobs")]
public class Job : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the primary key of the tenant associated with the job, used for multi-tenant filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the flow or agent this job is associated with.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the current status of the job, which can be one of the following values: 
    /// Running, Completed, Failed, or Canceled.
    /// </summary>
    public JobStatusTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the number of retries attempted for the job. 
    /// This value will increment if the job is retried due to failure or other reasons.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution started.
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution completed. 
    /// This property is null if the job is still running.
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// Gets or sets the duration of the job execution. It is calculated as the difference 
    /// between StartTime and EndTime.
    /// </summary>
    public TimeSpan? Duration { get; set; }

    /// <summary>
    /// Gets or sets the execution logs associated with the job. These logs may be stored as a string 
    /// or in JSON format and contain information about the job's execution steps, errors, or outputs.
    /// </summary>
    public string? ExecutionLogs { get; set; }

    /// <summary>
    /// Navigation property for the associated flow. Represents the flow/agent that triggered this job.
    /// </summary>
    public virtual FlowVersion? FlowVersion { get; set; }
}
