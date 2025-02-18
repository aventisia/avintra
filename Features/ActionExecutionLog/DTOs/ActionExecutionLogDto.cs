namespace WorkspaceAPIs.DTOs;

public class ActionExecutionLogDto
{
    /// <summary>
    /// Gets or sets the action execution log identifier
    /// </summary>
    public Guid Id { get; set; }
    /// <summary>
    /// Gets or sets the action name for the action execution log
    /// </summary>
    public required string ActionName { get; set; }

    /// <summary>
    /// Gets or sets the input data for the action execution log
    /// </summary>
    public required string InputData { get; set; }

    /// <summary>
    /// Gets or sets the output data for the action execution log
    /// </summary>
    public required string OutputData { get; set; }

    /// <summary>
    /// Gets or sets the ID of the flow execution log to which the execution log belongs.
    /// </summary>
    public required Guid FlowExecutionLogId { get; set; }

    /// <summary>    
    /// Gets or sets the the execution type who created the executed, such as user actions, automated scheduling, or external events
    /// </remarks>
    public ExecutionTypesEnum ExecutionType { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the executed.
    /// </summary>
    public string? ExecutedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was executed.
    /// </summary>
    public DateTimeOffset ExecutedOn { get; set; }
}