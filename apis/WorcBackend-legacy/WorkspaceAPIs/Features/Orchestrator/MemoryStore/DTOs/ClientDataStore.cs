namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the status information of a machine, including its unique identifiers, client type, current operational status, and the timestamp of the last status update.
/// </summary>
public class ClientDataStore
{
    /// <summary>
    /// Gets or sets the unique connection identifier for the client.
    /// </summary>
    public required string ConnectionId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the tenant (machine).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the agent managing the machine.
    /// </summary>
    public Guid ClientId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the agent.
    /// </summary>
    public Guid? AgentId { get; set; }

    /// <summary>
    /// Gets or sets the type of the client (e.g., WebBrowserUser, DesktopAppUser, AssistAppMachine), indicating the platform or application used.
    /// </summary>
    public ClientTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the current status of the machine (e.g., Online, Offline, Running, Idle).
    /// </summary>
    public MachineStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of the last update to the machine's status.
    /// </summary>
    public DateTimeOffset LastSeen { get; set; }

    /// <summary>
    /// Gets or sets the job Id associated with the machine. This property is nullable.
    /// </summary>
    public Guid? JobId { get; set; }
}