namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents an ephemeral chat message exchanged between collaborators in a flow
/// version's collaboration session. Messages are broadcast-only and never persisted.
/// A null <see cref="RecipientUserId"/> means the message is a group message sent to
/// every user currently present in the flow; a non-null value targets a single user.
/// </summary>
public class ChatMessageDto
{
    /// <summary>
    /// Gets or sets the flow version id the message belongs to.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the id of the user who sent the message (stamped server-side from
    /// the JWT, matching the identifier the studio frontend compares against).
    /// </summary>
    public string? SenderUserId { get; set; }

    /// <summary>
    /// Gets or sets the display name of the sender (from the JWT "name" claim, falling
    /// back to email).
    /// </summary>
    public string? SenderDisplayName { get; set; }

    /// <summary>
    /// Gets or sets the sender's email address.
    /// </summary>
    public string? SenderEmail { get; set; }

    /// <summary>
    /// Gets or sets the id of the intended recipient. When null, the message is a group
    /// message for everyone in the flow.
    /// </summary>
    public string? RecipientUserId { get; set; }

    /// <summary>
    /// Gets or sets the message text.
    /// </summary>
    public required string Message { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the message was sent (stamped server-side).
    /// </summary>
    public DateTimeOffset SentAt { get; set; }
}
