namespace WorkspaceAPIs.DTOs;

/// <summary>
/// DTO for getting job record details. This DTO contains all the properties related to a job record, including its unique identifier, flow name, flow type, status, flow version ID, trigger type, priority, retry count, created by information, timestamps, execution location, remarks, input and output data, and last node log.
/// </summary>
public class JobRecordDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the job.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow associated with the job.
    /// </summary>
    public required string FlowName { get; set; }

    /// <summary>
    /// Gets or sets the version of the flow associated with the job.
    /// NOTE: Keeping it string to support versioning like 1.0.0, 1.0.1, 1.1.0 etc. in future. 
    /// </summary>
    public required string FlowVersionNumber { get; set; }

    /// <summary>
    ///  Gets or sets the type of the flow associated with the job. This indicates whether the flow is an agent, process, or any other defined type.  
    /// </summary>
    public FlowTypesEnum FlowType { get; set; }

    /// <summary>
    /// Gets or sets the status of the job.
    /// </summary>
    public JobStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the flow linked to the job.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the FlowVersionHistoryId associated with this job.
    /// </summary>
    public Guid FlowVersionHistoryId { get; set; }

    /// <summary>
    /// Gets or sets a value that indicates whether the flow version is published or unpublished.
    /// </summary>
    public bool IsFlowVersionPublished { get; set; }

    /// <summary>
    /// Gets or sets the trigger type for the job (e.g., manual, API, event-based).
    /// </summary>
    public TriggerTypesEnum TriggerType { get; set; }

    /// <summary>
    /// Gets or sets the priority level of the job.
    /// </summary>
    public JobPriorityEnum Priority { get; set; }

    /// <summary>
    /// Gets or sets the number of retries attempted for the job. This value increments if the job is retried due to failure or other reasons.
    /// </summary>
    public int RetryCount { get; set; }

    /// <summary>
    /// Gets or sets the name of the user or trigger that created the job.
    /// This could be a username for manual triggers or a trigger name for automated triggers. 
    /// This is not a relationship to the User entity or trigger entity, but rather a reference to the entity that initiated/created the job. 
    /// It is used for tracking and auditing purposes. 
    /// </summary>
    /// <remarks>
    /// Username will be saved in the format "Full Name (email)" for manual triggers and "trigger_[Full trigger name]" for automated triggers.
    /// </remarks>
    public required string CreatedByName { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user or trigger that created the job.
    /// This could be a user ID for manual triggers or a trigger ID for automated triggers. It is optional and may be null.
    /// This is not a relationship to the User entity or trigger entity, but rather a reference to the entity that triggered the job. 
    /// It is used for tracking and auditing purposes.
    /// </summary>
    public required Guid CreatedById { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job record was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the environment from where the job is being initiated or the platform (machine name or web server) where the job is going to be executed
    /// For unpublished flows, this will be Agent Builder (web) or Agent Builder (desktop) depending on the platform from where the job is being initiated.
    /// For published flows, this will be the machine id for desktop execution or "Web Server" for web server execution.
    /// </summary>
    /// <remarks>
    /// The MachineId (machine local or virtual machine where the job is supposed to run) is going to be env_os_osid_[username], which is a unique identifier for the machine.
    /// For example, dev_windows_f9e58876-0de0-452b-8f80-0dfc0e2b88cd_[gaurav], prod_linux_12345678-0de0-452b-8f80-0dfc0e2b88cd_[john doe]
    /// </remarks>
    public required string ExecutionLocation { get; set; }

    /// <summary>
    /// Gets or sets the remarks or additional information related to the job execution or status.
    /// </summary>
    public string? Remarks { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution started.
    /// </summary>
    public DateTimeOffset? StartTimeStamp { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution completed. This property is null if the job is still running.
    /// </summary>
    public DateTimeOffset? EndTimeStamp { get; set; }

    /// <summary>
    /// Gets the job execution duration in seconds, calculated as the difference between StartTimeStamp and EndTimeStamp.
    /// Returns 0 if the job is still running.
    /// </summary>
    public double Duration
    {
        get
        {
            if (StartTimeStamp.HasValue && EndTimeStamp.HasValue)
                return (EndTimeStamp.Value - StartTimeStamp.Value).TotalSeconds;
            return 0;
        }
    }

    /// <summary>
    /// Gets or sets the total credits consumed for the job execution. This value is set when the job reaches a terminal state.
    /// </summary>
    public double? CreditsConsumed { get; set; }

    /// <summary>
    /// Gets or sets the input payload for the job in JSON format.
    /// </summary>
    public JsonDocument? JobInputData { get; set; }

    /// <summary>
    /// Gets or sets the output payload for the job in JSON format.
    /// </summary>
    public JsonDocument? JobOutputData { get; set; }

    /// <summary>
    /// Gets or sets execution log of the last executed node in the job if job fails or is aborted. 
    /// This can be useful for debugging and understanding the state of the job at the point of failure or abortion.
    /// </summary>
    public JsonDocument? LastNodeLog { get; set; }
}
