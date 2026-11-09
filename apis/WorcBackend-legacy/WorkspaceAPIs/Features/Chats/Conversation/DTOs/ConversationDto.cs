namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a conversation entry, including identifiers, metadata, and current status.
/// </summary>
public class ConversationDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the conversation.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user associated with the conversation.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the related flow version.
    /// </summary>
    public required Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the conversation title, generated from the most recent message
    /// by taking its first 5 words. Defaults to "Untitled Conversation" if no message content is available.
    /// </summary>
    public string Title { get; set; } = "Untitled Conversation";

    /// <summary>
    /// Gets or sets the current status of the conversation lifecycle.
    /// </summary>
    public ConversationStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the channel that created the conversation.
    /// </summary>
    public ConversationChannelEnum Channel { get; set; } = ConversationChannelEnum.Chat;
}
