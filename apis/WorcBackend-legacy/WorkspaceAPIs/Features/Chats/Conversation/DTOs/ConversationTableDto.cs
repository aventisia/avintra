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

    // TODO: Update summmary as last of message of conversations ( first 4/5 word)
    /// <summary>
    /// Gets or sets the title of the conversation.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the current status of the conversation lifecycle.
    /// </summary>
    public ConversationStatusEnum Status { get; set; }
}