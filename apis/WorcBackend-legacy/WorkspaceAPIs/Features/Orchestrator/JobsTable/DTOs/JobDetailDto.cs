namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the details of a job execution, providing essential information like job ID, status, execution time, and related flow data.
/// This DTO is used for displaying job details in a tabular format.
/// </summary>
public class JobDetailDto
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
    public JobPriorityTypesEnum Priority { get; set; } = JobPriorityTypesEnum.Normal;

    /// <summary>
    /// Gets or sets the current status of the job (e.g., Running, Completed, Failed, Canceled).
    /// </summary>
    public JobStatusTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the machine on which the job is running.
    /// This can be null if the machine is not assigned.
    /// </summary>
    public Guid? MachineId { get; set; }

    /// <summary>
    /// Gets or sets the version number of the flow record associated with the job.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets a JSON string representing the flow’s nodes, edges, and viewport configuration in a React Flow format.
    /// </summary>
    public string? ReactFlowObject { get; set; }

    /// <summary>
    /// Gets or sets a JSON string containing flow variables. It includes the name, value, and data type of each variable.
    /// </summary>
    public string? FlowVariablesObject { get; set; }

    /// <summary>
    /// Gets or sets the InputOutputObject, which is a JSON string that defines the input and output data for the flow.
    /// </summary>
    public string? InputOutputObject { get; set; }

    /// <summary>
    /// Gets or sets a JSON string defining the input arguments for the job from the trigger.
    /// </summary>
    public string? InputArgumentsJson { get; set; }

    /// <summary>
    /// Gets or sets the type of the flow (e.g., regular, conditional, batch).
    /// </summary>
    public FlowTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the identifier or name of the user/system that executed the job.
    /// </summary>
    public string? ExecutedBy { get; set; }

    // <summary>
    /// Gets or sets the machine or environment where the job was executed.
    /// Contains the local machine name for desktop execution, or "Web Server" for web server execution.
    /// </summary>
    public string? ExecutedOn { get; set; }
}
