namespace WorkspaceAPIs.DTOs;

public class FlowExecutionLogDto
{
    /// <summary>
    /// Gets or sets the execution log identifier
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the duration for the flow execution log
    /// </summary>
    public int? Duration { get; set; }

    /// <summary>
    /// Gets or sets the status for the flow execution log
    /// </summary>
    public FlowExecutionLogStatusEnum? Status { get; set; }

    /// <summary>
    /// Gets or sets the error message for the flow execution log
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Gets or sets the ID of the flow to which the execution log belongs.
    /// </summary>
    public required Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? ExecutedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset ExecutedOn { get; set; }

    /// <summary>    
    /// Gets or sets the the execution type who created the executed, such as user actions, automated scheduling, or external events
    /// </remarks>
    public ExecutionTypesEnum ExecutionType { get; set; }

    public IEnumerable<ActionExecutionLogDTO>? ActionExecutionLogs { get; }
}