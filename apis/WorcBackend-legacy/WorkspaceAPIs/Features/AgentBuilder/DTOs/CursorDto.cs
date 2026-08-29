namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a collaborator's live cursor position on the agent builder canvas,
/// broadcast to other users in the same flow version group. Coordinates are in
/// flow space (not screen space) so they remain correct under pan/zoom.
/// Cursors are ephemeral — broadcast-only with a short frontend TTL; they are
/// not persisted in the <see cref="CollaborationStore"/>.
/// </summary>
public class CursorDto
{
    /// <summary>
    /// Gets or sets the flow version id the cursor belongs to.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the cursor's X coordinate in flow space.
    /// </summary>
    public double X { get; set; }

    /// <summary>
    /// Gets or sets the cursor's Y coordinate in flow space.
    /// </summary>
    public double Y { get; set; }

    /// <summary>
    /// Gets or sets the user's unique identifier, as a string representation of the
    /// user Guid (the same value PresenceDto.UserId carries). Keyed for color so a
    /// user's cursor color matches their presence avatar color. Kept as a string so it
    /// serializes cleanly over SignalR without Guid/string binding mismatches.
    /// </summary>
    public string? UserId { get; set; }

    /// <summary>
    /// Gets or sets the user's display name (from the JWT "name" claim, falling back to email).
    /// </summary>
    public string? DisplayName { get; set; }

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Gets or sets the SignalR connection id for the sender, used by recipients to
    /// distinguish between multiple tabs/connections of the same user and to filter
    /// out their own cursor.
    /// </summary>
    public string? ConnectionId { get; set; }
}
