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
    /// Null for agent-less landing conversations.
    /// </summary>
    public Guid? FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the conversation title. Landing conversations use their stored title, empty until the first turn titles them;
    /// agent conversations use the most recent message content truncated to 120 characters, or "Untitled Conversation".
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

    /// <summary>
    /// Gets or sets the date and time when the conversation was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the conversation was last modified.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; }

    /// <summary>
    /// Gets or sets whether the conversation has a live read-only share link.
    /// </summary>
    public bool IsShared { get; set; }

    /// <summary>
    /// Gets or sets the LiteLLM provider of the model last used in this landing chat. Max-100 characters.
    /// </summary>
    public string? ModelProvider { get; set; }

    /// <summary>
    /// Gets or sets the model last used in this landing chat. Max-255 characters.
    /// </summary>
    public string? ModelId { get; set; }

    /// <summary>
    /// Gets or sets the reasoning effort last picked for this landing chat. Max-20 characters.
    /// </summary>
    public string? ReasoningEffort { get; set; }

    /// <summary>
    /// Gets or sets whether web search was last enabled for this landing chat.
    /// </summary>
    public bool? WebSearch { get; set; }
}
