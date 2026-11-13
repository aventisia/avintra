namespace WorkspaceAPIs.Features.Chats.ChatProjects.DTOs;

/// <summary>
/// The payload used to create a project.
/// </summary>
public class InsertChatProjectDto
{
    /// <summary>
    /// Gets or sets the project name. Max-100 characters.
    /// </summary>
    [Required]
    [StringLength(100)]
    public required string Name { get; set; }
}
