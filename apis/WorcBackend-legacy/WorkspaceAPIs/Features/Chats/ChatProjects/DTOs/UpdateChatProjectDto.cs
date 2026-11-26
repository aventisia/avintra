namespace WorkspaceAPIs.Features.Chats.ChatProjects.DTOs;

/// <summary>
/// The payload used to rename a project and set its instructions.
/// </summary>
public class UpdateChatProjectDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the project.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the project name. Max-100 characters.
    /// </summary>
    [StringLength(100)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the instructions. Null leaves them unchanged; blank clears them. Max-4000 characters.
    /// </summary>
    [StringLength(4000)]
    public string? Instructions { get; set; }
}
