namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for sending an agent command.
/// </summary>
public class ExecutionCommandDto
{
    /// <summary>
    /// The type of execution command to be performed by the agent.
    /// </summary>
    public ExecutionCommandTypesEnum Command { get; set; }

    /// <summary>
    /// The unique identifier of the job associated with this command.
    /// </summary>
    public Guid JobId { get; set; }

    /// <summary>
    /// The unique identifier of the agent that will execute the command.
    /// </summary>
    public Guid AgentId { get; set; }

    /// <summary>
    /// The unique identifier of the machine where the agent is running.
    /// </summary>
    public Guid MachineId { get; set; }
}