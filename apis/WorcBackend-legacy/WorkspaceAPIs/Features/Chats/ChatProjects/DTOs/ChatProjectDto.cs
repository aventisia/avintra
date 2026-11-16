namespace WorkspaceAPIs.Features.Chats.ChatProjects.DTOs;

/// <summary>
/// A project the signed-in user can file chats under.
/// </summary>
public class ChatProjectDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the project.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the project name.
    /// </summary>
    public required string Name { get; set; }
}
