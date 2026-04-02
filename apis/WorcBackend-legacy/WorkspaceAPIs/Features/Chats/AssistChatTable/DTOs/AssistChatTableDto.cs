namespace WorkspaceAPIs.DTOs;

public class AssistChatTableDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the associated flow version.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the flow.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the flow.
    /// </summary>
    public FlowTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the total number of conversations associated with this flow version.
    /// </summary>
    public int? ConversationCount { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the flow version is archived.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets the version number of the flow.
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets the list of conversations (ordered by most recent first).
    /// </summary>
    public List<ConversationSummaryDto> Conversations { get; set; } = new();

    /// <summary>
    /// Gets or sets a value indicating whether the record is disabled (used when deletion is not preferred).
    /// </summary>
    public bool IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the username of the creator.
    /// </summary>
    public string? CreatedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

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