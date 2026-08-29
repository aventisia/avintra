namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a real-time node edit broadcast to other collaborators.
/// </summary>
public class NodeEditDto
{
    /// <summary>
    /// Gets or sets the flow version id the node belongs to.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the id of the edited node.
    /// </summary>
    public required string NodeId { get; set; }

    /// <summary>
    /// Gets or sets the full node object (serialized JSON) after the edit.
    /// </summary>
    public required string Node { get; set; }

    /// <summary>
    /// Gets or sets the id of the user who made the edit.
    /// Overwritten from the JWT on the server; string to tolerate client-sent ids.
    /// </summary>
    public string EditedByUserId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display name of the user who made the edit.
    /// </summary>
    public string? EditedByDisplayName { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of the edit.
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }
}
