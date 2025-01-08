namespace WorkspaceAPIs.Entities;

public class FlowExecutionLog : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }
    
    /// <summary>
    /// Gets or sets the action name for the flow execution log
    /// </summary>
    public string ActionName { get; set; }

    /// <summary>
    /// Gets or sets the input data for the flow execution log
    /// </summary>
    public string InputData { get; set; }

    /// <summary>
    /// Gets or sets the output data for the flow execution log
    /// </summary>
    public string OutputData { get; set; }

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
    /// Gets or sets the ID of the flow to which the flow execution log belongs.
    /// </summary>
    public required Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the Flow this flow Execution log is associated with.
    /// </summary>
    [ForeignKey("FlowId")]
    public virtual Flow? Flow { get; set; }

}