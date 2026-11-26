namespace WorkspaceAPIs.Features.Chats.ChatProjects.DTOs;

/// <summary>
/// The payload used to attach a text file to a project.
/// </summary>
public class InsertChatProjectFileDto
{
    /// <summary>
    /// Gets or sets the file name. Max-200 characters.
    /// </summary>
    [StringLength(200)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the file text.
    /// </summary>
    public required string Content { get; set; }
}
