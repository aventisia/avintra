namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) representing a message within a conversation, including content, sender role, metadata, and lifecycle details.
/// </summary>
public class ConversationMessageDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the message.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the conversation this message belongs to.
    /// </summary>
    public Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the related flow version.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the message content (text, prompt, or response).
    /// </summary>
    public required string Content { get; set; }

    /// <summary>
    /// Gets or sets the role of the message sender (e.g., User, Assistant, System).
    /// </summary>
    public ConversationMessageSenderEnum Role { get; set; }

    /// <summary>
    /// Gets or sets additional structured metadata as JSON (e.g., tool calls, references).
    /// </summary>
    public JsonDocument? Metadata { get; set; }

    /// <summary>
    /// Gets or sets list of file URLs associated with this message.
    /// </summary>
    public List<string>? Files { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the message was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;
}