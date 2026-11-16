namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Files a landing conversation under a project, or ungroups it when the project is null.
/// </summary>
public class UpdateConversationProjectDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the conversation.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the project to file the conversation under, or null to ungroup it.
    /// </summary>
    public Guid? ProjectId { get; set; }
}
