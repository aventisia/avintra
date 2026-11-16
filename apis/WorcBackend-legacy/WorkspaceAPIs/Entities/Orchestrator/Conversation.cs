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
    /// Gets or sets the history title of a landing conversation, taken from its first message. Max-200.
    /// Null until the first landing turn is sent.
    /// </summary>
    [MaxLength(200)]
    public string? Title { get; set; }

    /// <summary>
    /// Gets or sets whether a landing conversation is pinned above the rest of the history.
    /// </summary>
    public bool IsPinned { get; set; }

    /// <summary>
    /// Gets or sets the ID of the project this chat is filed under, or null when ungrouped.
    /// </summary>
    public Guid? ProjectId { get; set; }

    /// <summary>
    /// Gets or sets the project this chat is filed under.
    /// </summary>
    [ForeignKey("ProjectId")]
    public virtual ChatProject? Project { get; set; }

    /// <summary>
    /// Gets or sets the read-only share token. Null when the conversation is not shared. Max-64 characters.
    /// </summary>
    [MaxLength(64)]
    public string? ShareToken { get; set; }

    /// <summary>
    /// Gets or sets the Flow Version this conversation is associated with.
    /// </summary>
    [ForeignKey("FlowVersionId")]
    public virtual FlowVersion? FlowVersion { get; set; }

    /// <summary>
    /// Gets or sets the ID of the Flow Version.
    /// Null for agent-less landing conversations.
    /// </summary>
    public Guid? FlowVersionId { get; set; }

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