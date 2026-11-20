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
    /// Gets or sets the reference identifier for the job. For jobs created by another flow, this is the parent job's ID.
    /// </summary>
    public Guid? RefId { get; set; }

    /// <summary>
    /// Gets or sets the priority level of the job.
    /// </summary>
    public JobPriorityEnum? Priority { get; set; } = JobPriorityEnum.Normal;


    /// <summary>
    /// Gets or sets the execution location: a machine's unique name or an unassigned sentinel.
    /// </summary>
    /// <remarks>
    /// For unpublished flows this is the Agent Builder origin (web or desktop). For published flows
    /// this is the machine's unique name ([username]_os_osId), "Cloud", or "Web Server" (the latter
    /// two keep the job unassigned until dispatch).
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
    /// Gets or sets the job ID of any attempt in an existing retry chain.
    /// The new attempt gets a fresh job ID, shares the chain's SourceJobId, and is numbered one above the chain's latest attempt.
    /// The job must exist for the same flowVersionId, and the latest attempt must have reached a terminal status.
    /// The retry inherits the chain's trigger type and parent reference; any trigger type or reference in this payload applies to fresh jobs only.
    /// </summary>
    public Guid? ExistingJobId { get; set; }
}
