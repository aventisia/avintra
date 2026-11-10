namespace WorkspaceAPIs.DTOs;

/// <summary>
/// A landing conversation as listed in the chat history.
/// </summary>
public class LandingConversationDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the conversation.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the conversation title. Max-200.
    /// </summary>
    public required string Title { get; set; }

    /// <summary>
    /// Gets or sets when the conversation last changed, which orders the history.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; }
}
