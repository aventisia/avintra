namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the details of a job execution, providing essential information like job ID, status, execution time, and related flow data.
/// This DTO is used for displaying job details in a tabular format.
/// </summary>
public class JobExecutionLogDetailDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the job.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow or agent associated with this job.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the flow to the job.
    /// </summary>
    public Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the flow version related to this job.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the type of trigger that initiated the job (e.g., manual, API call, event-driven).
    /// </summary>
    public TriggerTypesEnum TriggerType { get; set; } = TriggerTypesEnum.None;

    /// <summary>
    /// Gets or sets the unique identifier of the trigger that started the job. This can be null if no trigger is associated.
    /// </summary>
    public Guid? RefId { get; set; }

    /// <summary>
    /// Gets or sets the priority level of the job (e.g., Normal, High).
    /// </summary>
    public JobPriorityEnum Priority { get; set; } = JobPriorityEnum.Normal;

    /// <summary>
    /// Gets or sets the current status of the job (e.g., Running, Completed, Failed, Canceled).
    /// </summary>
    public JobStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the version number of the flow record associated with the job.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the serialized JSON representation of the flow structure,including nodes, edges, and viewport configuration.
    /// </summary>
    public string? ReactFlowObject { get; set; } = "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";

    /// <summary>
    /// Gets or sets the serialized JSON object containing flow variables, including each variable's name, value, and data type.
    /// </summary>
    public string? FlowVariablesObject { get; set; }

    /// <summary>
    /// Gets or sets the serialized JSON definition of the flow's input and output configuration.
    /// </summary>
    public string? InputOutputObject { get; set; }

    /// <summary>
    /// Gets or sets the collection of per-node execution logs for the job.
    /// </summary>
    public List<NodeExecutionLogDto> NodeExecutionLogs { get; set; } = [];

    /// <summary>
    /// Gets or sets the type of the flow (e.g., regular, conditional, batch).
    /// </summary>
    public FlowTypesEnum Type { get; set; }
}
