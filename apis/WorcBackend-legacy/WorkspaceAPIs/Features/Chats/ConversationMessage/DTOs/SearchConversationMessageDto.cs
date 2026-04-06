namespace WorkspaceAPIs.DTOs;

/// <summary>
/// DTO used for retrieving and searching conversation messages, including content, sender details, and associated flow metadata.
/// </summary>
public class SearchConversationMessageDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the message.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the conversation to which this message belongs.
    /// </summary>
    public required Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the text content of the message (user input or system/assistant response).
    /// </summary>
    public required string Content { get; set; }

    /// <summary>
    /// Gets or sets the role of the sender (e.g., User, Assistant, System).
    /// </summary>
    public ConversationMessageSenderEnum Role { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the message was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the identifier of the associated flow version.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the name of the associated flow.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the optional description of the flow or template.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the flow version is archived.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets the version number of the associated flow.
    /// </summary>
    public int VersionNumber { get; set; }
}