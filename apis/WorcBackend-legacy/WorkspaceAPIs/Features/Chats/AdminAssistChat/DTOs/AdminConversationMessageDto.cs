namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a conversation along with its associated messages, including sender roles, content, metadata, and lifecycle information.
/// </summary>
public class AdminConversationMessageDto : AdminConversationDto
{
    /// <summary>
    /// Gets or sets the collection of messages that belong to the conversation.
    /// </summary>
    public IEnumerable<ConversationMessageDto>? Messages { get; set; }
}