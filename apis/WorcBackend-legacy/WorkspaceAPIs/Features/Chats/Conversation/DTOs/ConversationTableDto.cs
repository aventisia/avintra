namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a conversation entry, including identifiers, metadata, and current status.
/// </summary>
public class ConversationTableDto
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
    /// Gets or sets the title of the conversation.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the current status of the conversation lifecycle.
    /// </summary>
    public ConversationStatusTypes Status { get; set; }
}