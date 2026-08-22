namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for sending an agent command.
/// </summary>
public class ExecutionCommandDto
{
    /// <summary>
    /// The unique identifier of the job associated with this command.
    /// </summary>
    public Guid JobId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the tenant.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// The type of execution command to be performed by the agent.
    /// </summary>
    public ExecutionCommandTypesEnum Command { get; set; }

    /// <summary>
    /// The unique identifier of the agent that will execute the command.
    /// </summary>
    public Guid AgentId { get; set; }

    /// <summary>
    /// The unique name of the machine where the agent is running (e.g. <c>[username]_os_osid</c>).
    /// Used to identify the machine across the hub/websocket instead of the machine Guid id.
    /// </summary>
    public string? MachineName { get; set; }
}