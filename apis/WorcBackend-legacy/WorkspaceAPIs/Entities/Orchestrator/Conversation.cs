namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a Conversation, linking a user to a specific Flow Version in the context of a tenant.
/// </summary>
[Table("worc_Conversations")]
public class Conversation : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant ID associated with this conversation.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the title of the conversion.
    /// </summary>
    public required string Title { get; set; }

    /// <summary>
    /// Gets or sets the current lifecycle status of the conversation.
    /// </summary>
    public ConversationStatusTypes Status { get; set; }

    /// <summary>
    /// Indicates whether the conversation is archived by the user. Archived conversations are read-only and hidden from the active list.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the conversation was archived.
    /// </summary>
    public DateTimeOffset? ArchivedOn { get; set; }

    /// <summary>
    /// Gets or sets the Flow Version this conversation is associated with.
    /// </summary>
    [ForeignKey("FlowVersionId")]
    public virtual FlowVersion? FlowVersion { get; set; }

    /// <summary>
    /// Gets or sets the ID of the Flow Version.
    /// </summary>
    public required Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the workspace user associated with this conversation.
    /// </summary>
    [ForeignKey("UserId")]
    public virtual WorkspaceUser? User { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user.
    /// </summary>
    public required Guid UserId { get; set; }

    /// <summary>
    /// Represents the one-to-many relationship between conversations and messages.
    /// </summary>
    public virtual ICollection<ConversationMessage>? Messages { get; set; }
}