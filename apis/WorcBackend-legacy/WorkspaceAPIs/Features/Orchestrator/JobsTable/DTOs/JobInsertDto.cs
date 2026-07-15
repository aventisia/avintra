namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to create a new job.
/// </summary>
public class JobInsertDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the flow version linked to the job.
    /// FlowVersionHistoryId will be fetched by the service logic. (This property 
    /// is used to link the job to a specific version history of the flow that is 
    /// being executed. It allows the system to track which version of the flow 
    /// was used for the job execution, enabling better traceability and debugging.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the trigger type for the job.
    /// </summary>
    public TriggerTypesEnum TriggerType { get; set; } = TriggerTypesEnum.Manual;

    /// <summary>
    /// Gets or sets the priority level of the job.
    /// </summary>
    public JobPriorityEnum Priority { get; set; } = JobPriorityEnum.Normal;

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
    /// Gets or sets the input payload for the job in JSON format.
    /// </summary>
    public JsonDocument? JobInputData { get; set; }

    /// <summary>
    /// Gets or sets the optional job id to create the job with retryCount > 0.
    /// If provided, the job id will remain the same but retry count > 0. Also, jobId should exist in the database for the same flowVersionId.
    /// If not provided, a new job id will be generated and retry count will be 0.
    /// </summary>
    public Guid? JobId { get; set; }
}