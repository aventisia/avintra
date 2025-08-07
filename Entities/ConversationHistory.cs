namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Represents an individual message exchanged within a conversation, specifically related to a machine learning model. 
/// Designed to support multi-tenant scenarios, it captures message metadata such as participant details, content, and timestamps.
/// </summary>
public class ConversationHistory : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for this particular message record.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the tenant associated with this conversation history entry.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the type of participant involved in the conversation (e.g., User, Bot, Automation).
    /// </summary>
    [Required]
    public ParticipantTypesEnum ParticipantType { get; set; }

    /// <summary>
    /// Gets or sets the name displayed for the participant.
    /// </summary>
    [Required]
    public string? ParticipantName { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the participant.
    /// </summary>
    public string? ParticipantId { get; set; }

    /// <summary>
    /// Gets or sets the content of the message, limited to a maximum of 4000 characters.
    /// </summary>
    [Required]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Indicates whether the message was sent by a user (true) or the system/model (false).
    /// </summary>
    public bool IsUserMessage { get; set; }

    /// <summary>
    /// Gets or sets the UTC timestamp of when the message was created.
    /// </summary>
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Gets or sets an optional identifier used to group messages that belong to the same conversation session.
    /// </summary>
    public Guid? ConversationId { get; set; }

    /// <summary>
    /// Gets or sets the identifier for the machine learning model that generated or received this message.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Navigation property for the related machine learning model entity.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }
}