namespace WorkspaceAPIs.DTOs;

public class ConversationSummaryDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the conversation.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the conversation title, generated from the most recent message
    /// by taking its first 5 words. Defaults to "Untitled Conversation" if no message content is available.
    /// </summary>
    public string Title { get; set; } = "Untitled Conversation";

    /// <summary>
    /// Gets or sets the timestamp of the conversation (e.g., last activity time).
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>
    /// Gets or sets the status of the conversation.
    /// </summary>
    public ConversationStatusEnum Status { get; set; }
}