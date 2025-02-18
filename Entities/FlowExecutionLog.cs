namespace WorkspaceAPIs.Entities;

public class FlowExecutionLog : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the record's primary key in Guid (globally unique identifier) format.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    // <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

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

    /// <summary>
    /// Gets or sets the ID of the flow to which the flow execution log belongs.
    /// </summary>
    public required Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the Flow this flow Execution log is associated with.
    /// </summary>
    [ForeignKey("FlowId")]
    public virtual Flow? Flow { get; set; }

    /// <summary>
    /// Gets or sets the list of Action Execution Logs to manage the one-to-many relation.
    /// </summary>
    public virtual ICollection<ActionExecutionLog>? ActionExecutionLogs { get; set; }
}