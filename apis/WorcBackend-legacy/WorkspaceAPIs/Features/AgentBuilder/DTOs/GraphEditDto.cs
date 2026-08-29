namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a full graph snapshot broadcast for structural changes (node/edge add or
/// delete). Structural edits re-run dagre layout on the sender, which repositions the
/// whole graph, so collaborators replace their entire graph rather than merging a single
/// node (which would otherwise overlap).
/// </summary>
public class GraphEditDto
{
    /// <summary>
    /// Gets or sets the flow version id the graph belongs to.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the full nodes array (serialized JSON) after the structural change.
    /// </summary>
    public required string Nodes { get; set; }

    /// <summary>
    /// Gets or sets the full edges array (serialized JSON) after the structural change.
    /// </summary>
    public required string Edges { get; set; }

    /// <summary>
    /// Gets or sets the id of the user who made the change.
    /// </summary>
    public string EditedByUserId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the display name of the user who made the change.
    /// </summary>
    public string? EditedByDisplayName { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of the change.
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }
}
