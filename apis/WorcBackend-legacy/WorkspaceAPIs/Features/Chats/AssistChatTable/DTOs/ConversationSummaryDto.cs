namespace WorkspaceAPIs.DTOs;

public class ConversationSummaryDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the conversation.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the title of the conversation.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the timestamp of the conversation (e.g., last activity time).
    /// </summary>
    public DateTimeOffset Time { get; set; }

    /// <summary>
    /// Gets or sets the status of the conversation (temporary as string, can be enum later).
    /// </summary>
    public string Status { get; set; } = string.Empty;
}