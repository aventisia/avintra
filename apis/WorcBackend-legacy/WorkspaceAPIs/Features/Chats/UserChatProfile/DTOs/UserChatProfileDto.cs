namespace WorkspaceAPIs.Features.Chats.UserChatProfile.DTOs;

public class UserChatProfileDto
{
    /// <summary>
    /// Gets or sets how the assistant should respond for this user.
    /// </summary>
    public string CustomInstructions { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the facts the user wants the assistant to remember across chats.
    /// </summary>
    public string MemoryNotes { get; set; } = string.Empty;
}
