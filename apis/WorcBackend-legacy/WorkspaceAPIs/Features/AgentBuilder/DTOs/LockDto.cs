namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Identifies the type of resource a collaboration lock applies to.
/// </summary>
public enum LockTargetType
{
    Node,
    Edge,
    FlowAction,
}

/// <summary>
/// Represents a hard lock held by a user on a node, edge, or flow-level action
/// within a flow version's collaboration session.
/// </summary>
public class LockDto
{
    /// <summary>
    /// Gets or sets the unique lock key: $"{FlowVersionId}:{TargetType}:{TargetId}".
    /// </summary>
    public required string LockKey { get; set; }

    /// <summary>
    /// Gets or sets the flow version id the lock belongs to.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the type of target being locked.
    /// </summary>
    public LockTargetType TargetType { get; set; }

    /// <summary>
    /// Gets or sets the id of the target (node id, edge id, or flow action name).
    /// </summary>
    public required string TargetId { get; set; }

    /// <summary>
    /// Gets or sets the id of the user holding the lock.
    /// Inbound value from the client is ignored (overwritten from the JWT on the server),
    /// so it is kept as a string to tolerate the client sending its own identifier.
    /// </summary>
    public string HolderUserId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display name of the user holding the lock.
    /// </summary>
    public string? HolderDisplayName { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the lock was acquired.
    /// </summary>
    public DateTimeOffset AcquiredAt { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the lock expires (server-side TTL).
    /// </summary>
    public DateTimeOffset ExpiresAt { get; set; }
}
