namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Identifies a flow-level action that can be locked to prevent concurrent
/// destructive operations (publish, delete, version restore).
/// </summary>
public enum FlowActionType
{
    Publish,
    Delete,
    RestoreVersion,
}

/// <summary>
/// Represents a lock on a flow-level action within a collaboration session.
/// </summary>
public class FlowActionLockDto
{
    /// <summary>
    /// Gets or sets the flow version id the action applies to.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the flow action being locked.
    /// </summary>
    public FlowActionType Action { get; set; }

    /// <summary>
    /// Gets or sets the id of the user holding the action lock.
    /// Overwritten from the JWT on the server; string to tolerate client-sent ids.
    /// </summary>
    public string HolderUserId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display name of the user holding the action lock.
    /// </summary>
    public string? HolderDisplayName { get; set; }
}
