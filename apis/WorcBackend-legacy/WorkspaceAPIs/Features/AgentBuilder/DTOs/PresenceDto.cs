namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a user currently present in a flow's collaboration session.
/// </summary>
public class PresenceDto
{
    /// <summary>
    /// Gets or sets the user's unique identifier.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the user's display name (from the JWT "name" claim, falling back to email).
    /// </summary>
    public string? DisplayName { get; set; }

    /// <summary>
    /// Gets or sets the user's email address.
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Gets or sets the SignalR connection id for this presence entry.
    /// </summary>
    public string? ConnectionId { get; set; }

    /// <summary>
    /// Gets or sets the flow version id the user is currently viewing.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the user joined the flow.
    /// </summary>
    public DateTimeOffset JoinedAt { get; set; }
}
