namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents filter criteria used to retrieve conversations for administrative monitoring.
/// Supports filtering by archive status, date range, users, and flow versions.
/// </summary>
public class ConversationFilterDto
{
    /// <summary>
    /// Gets or sets a value indicating whether archived conversations should be included.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets the start date for filtering conversations.
    /// </summary>
    public DateTimeOffset? StartDate { get; set; }

    /// <summary>
    /// Gets or sets the end date for filtering conversations.
    /// </summary>
    public DateTimeOffset? EndDate { get; set; }

    /// <summary>
    /// Gets or sets the collection of user IDs used to filter conversations.
    /// </summary>
    public IEnumerable<Guid>? UserIds { get; set; }

    /// <summary>
    /// Gets or sets the collection of flow version IDs used to filter conversations.
    /// </summary>
    public IEnumerable<Guid>? FlowVersionIds { get; set; }

    /// <summary>
    /// Gets or sets the channel used to filter conversations. Null includes all channels.
    /// </summary>
    public ConversationChannelEnum? Channel { get; set; }
}
