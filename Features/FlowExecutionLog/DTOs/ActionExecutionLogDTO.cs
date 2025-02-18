namespace WorkspaceAPIs.DTOs;

public class ActionExecutionLogDTO
{
    /// <summary>
    /// Gets or sets the execution log identifier
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the action name for the execution log
    /// </summary>
    public required string ActionName { get; set; }

    /// <summary>
    /// Gets or sets the input data for the execution log
    /// </summary>
    public required string InputData { get; set; }

    /// <summary>
    /// Gets or sets the output data for the execution log
    /// </summary>
    public required string OutputData { get; set; }
}