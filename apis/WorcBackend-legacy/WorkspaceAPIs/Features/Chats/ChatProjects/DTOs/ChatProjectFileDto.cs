namespace WorkspaceAPIs.Features.Chats.ChatProjects.DTOs;

/// <summary>
/// A text file attached to a chat project, without its content.
/// </summary>
public class ChatProjectFileDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the file.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the file name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the UTF-8 size of the content in bytes.
    /// </summary>
    public int SizeBytes { get; set; }
}
