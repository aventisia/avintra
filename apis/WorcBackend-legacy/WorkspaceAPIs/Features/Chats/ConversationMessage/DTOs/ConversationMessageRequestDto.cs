namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a message within a conversation,
/// including content, sender role, metadata, and lifecycle details.
/// </summary>
public class ConversationMessageRequestDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the message.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the conversation this message belongs to.
    /// </summary>
    public required Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the message content (text, prompt, or response).
    /// </summary>
    public required string Content { get; set; }
}