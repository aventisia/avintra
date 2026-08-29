namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a real-time edge edit broadcast to other collaborators.
/// </summary>
public class EdgeEditDto
{
    /// <summary>
    /// Gets or sets the flow version id the edge belongs to.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the id of the edited edge.
    /// </summary>
    public required string EdgeId { get; set; }

    /// <summary>
    /// Gets or sets the full edge object (serialized JSON) after the edit.
    /// </summary>
    public required string Edge { get; set; }

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
