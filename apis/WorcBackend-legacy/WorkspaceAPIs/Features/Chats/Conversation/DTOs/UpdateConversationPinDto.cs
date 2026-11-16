namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Pins or unpins a landing conversation.
/// </summary>
public class UpdateConversationPinDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the conversation.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets whether the conversation is pinned.
    /// </summary>
    public bool IsPinned { get; set; }
}
