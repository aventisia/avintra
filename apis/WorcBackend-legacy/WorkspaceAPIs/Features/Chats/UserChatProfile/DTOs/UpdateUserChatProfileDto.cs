namespace WorkspaceAPIs.Features.Chats.UserChatProfile.DTOs;

public class UpdateUserChatProfileDto
{
    /// <summary>
    /// Gets or sets how the assistant should respond for this user. Max-1500 characters.
    /// </summary>
    [StringLength(1500)]
    public string CustomInstructions { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the facts the user wants the assistant to remember across chats. Max-4000 characters.
    /// </summary>
    [StringLength(4000)]
    public string MemoryNotes { get; set; } = string.Empty;
}
