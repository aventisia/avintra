namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the status information of a machine, including its unique identifiers, client type, current operational status, and the timestamp of the last status update.
/// </summary>
public class AgentBuilderModel
{
    /// <summary>
    /// Unique identifier for the active connection (e.g., SignalR connection ID).
    /// </summary>
    public required string ConnectionId { get; set; }

    /// <summary>
    /// Identifier of the tenant associated with this user.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Identifier of the client instance interacting with the system.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Timestamp indicating when the user was last active or seen.
    /// </summary>
    public DateTimeOffset LastSeen { get; set; }
}
