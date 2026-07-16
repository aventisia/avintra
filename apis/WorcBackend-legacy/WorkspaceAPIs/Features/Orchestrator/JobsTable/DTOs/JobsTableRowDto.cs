namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a single row in the jobs table, providing a summary of job record for display purposes.
/// NOTE: Same dto is being used for CSV export of jobs data. Display attributes are used to define the column names in the exported CSV file.
/// </summary>
public class JobsTableRowDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the job.
    /// </summary>
    [Display(Name = "Job ID")]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow associated with the job.
    /// </summary>
    [Display(Name = "Agent")]
    public required string FlowName { get; set; }

    /// <summary>
    /// Gets or sets the version of the flow associated with the job.
    /// NOTE: Keeping it string to support versioning like 1.0.0, 1.0.1, 1.1.0 etc. in future. 
    /// </summary>
    public required string FlowVersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the status of the job.
    /// </summary>
    public JobStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the flow linked to the job.
    /// </summary>
    [Display(Name = "Agent ID")]
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets a value that indicates whether the flow version is published or unpublished.
    /// </summary>
    [Display(Name = "Is Published")]
    public bool IsFlowVersionPublished { get; set; }

    /// <summary>
    /// Gets or sets the trigger type for the job (e.g., manual, API, event-based).
    /// </summary>
    [Display(Name = "Trigger Type")]
    public TriggerTypesEnum TriggerType { get; set; }

    /// <summary>
    /// Gets or sets the priority level of the job.
    /// </summary>
    public JobPriorityEnum Priority { get; set; }

    /// <summary>
    /// Gets or sets the number of retries attempted for the job. This value increments if the job is retried due to failure or other reasons.
    /// </summary>
    [Display(Name = "Retry Count")]
    public int RetryCount { get; set; }

    /// <summary>
    /// Gets or sets the name of the user or trigger that created the job.
    /// This could be a username for manual triggers or a trigger name for automated triggers. 
    /// This is not a relationship to the User entity or trigger entity, but rather a reference to the entity that initiated/created the job. 
    /// It is used for tracking and auditing purposes. 
    /// </summary>
    /// <remarks>
    /// TODO: Username will be saved in the format "Full Name (email)" for manual triggers and "trigger_[Full trigger name]" for automated triggers.
    /// </remarks>
    [Display(Name = "Created By")]
    public required string CreatedByName { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job record was created.
    /// </summary>
    [Display(Name = "Created At")]
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
    [Display(Name = "Execution Location")]
    public required string ExecutionLocation { get; set; }

    /// <summary>
    /// Gets or sets the remarks or additional information related to the job execution or status.
    /// </summary>
    public string? Remarks { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution started.
    /// </summary>
    [Display(Name = "Started At")]
    public DateTimeOffset? StartTimeStamp { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the job execution completed. This property is null if the job is still running.
    /// </summary>
    [Display(Name = "Ended At")]
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
}