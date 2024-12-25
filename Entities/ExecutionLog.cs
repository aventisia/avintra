namespace WorkspaceAPIs.Entities;

public class ExecutionLog : BaseEntity
{
    /// <summary>
    /// Gets or sets the action name for the execution log
    /// </summary>
    public string ActionName { get; set; }

    /// <summary>
    /// Gets or sets the input data for the execution log
    /// </summary>
    public string InputData { get; set; }

    /// <summary>
    /// Gets or sets the output data for the execution log
    /// </summary>
    public string OutputData { get; set; }

    /// <summary>
    /// Gets or sets the ID of the flow to which the execution log belongs.
    /// </summary>
    public required Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the Flow this Execution log is associated with.
    /// </summary>
    [ForeignKey("FlowId")]
    public virtual Flow? Flow { get; set; }

}