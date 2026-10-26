namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a single message within a conversation.
/// </summary>
[Table("run_ConversationMessages")]
public class ConversationMessage : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier (primary key) for the conversation message record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the tenant ID associated with this message.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the message content.
    /// </summary>
    public required string Content { get; set; }

    /// <summary>
    /// Gets or sets the role of message (e.g., User, System, Assistant).
    /// </summary>
    public ConversationMessageSenderEnum Role { get; set; }

    /// <summary>
    /// Gets or sets additional structured metadata as JSON.
    /// </summary>
    public JsonDocument? Metadata { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the ID of the conversation.
    /// </summary>
    public required Guid ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the conversation this message belongs to.
    /// </summary>
    [ForeignKey("ConversationId")]
    public virtual Conversation? Conversation { get; set; }
}