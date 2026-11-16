using WorkspaceAPIs.Features.Chats.ChatProjects.DTOs;

namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for the signed-in user's chat projects.
/// </summary>
public interface IChatProjectService
{
    /// <summary>
    /// Lists the signed-in user's projects by name.
    /// </summary>
    Task<ServiceResponse<IEnumerable<ChatProjectDto>>> GetChatProjectsAsync();

    /// <summary>
    /// Creates a project for the signed-in user.
    /// </summary>
    /// <param name="insertChatProjectDto">The project name.</param>
    Task<ServiceResponse<ChatProjectDto>> InsertChatProjectAsync(InsertChatProjectDto insertChatProjectDto);

    /// <summary>
    /// Deletes one of the signed-in user's projects. Its chats stay in the history, ungrouped.
    /// </summary>
    /// <param name="chatProjectId">The unique identifier of the project.</param>
    Task<ServiceResponse<bool>> DeleteChatProjectAsync(Guid chatProjectId);
}
