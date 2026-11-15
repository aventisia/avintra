namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a Conversation, linking a user to a specific Flow Version in the context of a tenant.
/// </summary>
[Table("run_Conversations")]
public class Conversation : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant ID associated with this conversation.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this conversation belongs to.
    /// Null indicates the conversation is in the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the current lifecycle status of the conversation.
    /// </summary>
    public ConversationStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the channel that created the conversation.
    /// </summary>
    public ConversationChannelEnum Channel { get; set; } = ConversationChannelEnum.Chat;

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
    public virtual ICollection<ConversationMessage> Messages { get; set; } = new List<ConversationMessage>();
}
