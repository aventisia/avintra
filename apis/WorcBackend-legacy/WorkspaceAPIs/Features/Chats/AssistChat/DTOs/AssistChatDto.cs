namespace WorkspaceAPIs.DTOs;

public class AssistChatDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the associated flow version.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the block pr template.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the flow version is archived.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets the version number of the flow version.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the list of conversations (ordered by most recent first).
    /// </summary>
    public List<ConversationSummaryDto> Conversations { get; set; } = new();

    /// <summary>
    /// Gets or sets the username of the modified.
    /// </summary>
    public string? LastModifiedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the record.
    /// This property is intended for response purposes only.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was last modified.
    /// This property is intended for response purposes only.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}