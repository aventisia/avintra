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
    public TriggerTypesEnum? TriggerType { get; set; } = TriggerTypesEnum.Manual;

    /// <summary>
    /// Gets or sets the priority level of the job.
    /// </summary>
    public JobPriorityEnum? Priority { get; set; } = JobPriorityEnum.Normal;


    /// <summary>
    /// Gets or sets where the job is executed: the target machine's unique name or an unassigned
    /// sentinel. For unpublished flows this is the Agent Builder origin (web or desktop). For
    /// published flows this is the machine's unique name ([username]_os_osId), "Cloud", or
    /// "Web Server" (the latter two keep the job unassigned until dispatch).
    /// </summary>
    /// <remarks>
    /// The machine's unique name (local or virtual machine where the job is supposed to run) is
    /// [username]_os_osid, a unique identifier for the machine.
    /// For example, [gaurav]_windows_f9e58876-0de0-452b-8f80-0dfc0e2b88cd or
    /// [john doe]_linux_12345678-0de0-452b-8f80-0dfc0e2b88cd.
    /// </remarks>
    public string? ExecutionLocation { get; set; }

    /// <summary>
    /// Gets or sets the input payload for the job in JSON format.
    /// </summary>
    public JsonDocument? JobInputData { get; set; }

    /// <summary>
    /// Optional existing job id to create the job with retryCount > 0.
    /// If provided, the job id will remain the same but retry count > 0. Also, the existing job id should exist in the database for the same flowVersionId.
    /// If not provided, a new job id will be generated and retry count will be 0.
    /// </summary>
    public Guid? ExistingJobId { get; set; }
}
