namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Renames a landing conversation.
/// </summary>
public class UpdateConversationTitleDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the conversation.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the new title. Max-200.
    /// </summary>
    [StringLength(200)]
    public required string Title { get; set; }
}
