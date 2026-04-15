namespace WorkspaceAPIs.DTOs;

public class AdminConversationDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the conversation.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the title of the conversation. It is generated from the first five words 
    /// of the most recent message. Defaults to "Untitled Conversation" if no content exists.
    /// </summary>
    public string Title { get; set; } = "Untitled Conversation";

    /// <summary>
    /// Gets or sets the timestamp representing the last activity of the conversation.
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>
    /// Gets or sets the current status of the conversation.
    /// </summary>
    public ConversationStatusEnum Status { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the first name of the user (maximum length: 50 characters).
    /// </summary>
    [MaxLength(50)]
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the last name of the user (maximum length: 50 characters).
    /// </summary>
    [MaxLength(50)]
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated flow version.
    /// </summary>
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Gets or sets the name of the associated flow.
    /// </summary>
    public string? FlowName { get; set; }

    /// <summary>
    /// Gets or sets the version number of the associated flow.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the record.
    /// </summary>
    public string? LastModifiedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the display name of the user who last modified the record (response only).
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was last updated (response only).
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}