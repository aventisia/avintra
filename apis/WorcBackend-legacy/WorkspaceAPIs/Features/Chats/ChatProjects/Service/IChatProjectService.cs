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
    /// Updates an existing chat project.
    /// </summary>
    /// <param name="updateChatProjectDto">The project identifier and its new name.</param>
    Task<ServiceResponse<ChatProjectDto>> UpdateChatProjectAsync(UpdateChatProjectDto updateChatProjectDto);

    /// <summary>
    /// Deletes one of the signed-in user's projects. Its chats stay in the history, ungrouped.
    /// </summary>
    /// <param name="chatProjectId">The unique identifier of the project.</param>
    Task<ServiceResponse<bool>> DeleteChatProjectAsync(Guid chatProjectId);

    /// <summary>
    /// Retrieves list of chat project files for one of the signed-in user's projects.
    /// </summary>
    /// <param name="chatProjectId">The unique identifier of the project.</param>
    Task<ServiceResponse<IEnumerable<ChatProjectFileDto>>> GetChatProjectFilesAsync(Guid chatProjectId);

    /// <summary>
    /// Inserts a new chat project file, within the file count and size limits.
    /// </summary>
    /// <param name="chatProjectId">The unique identifier of the project.</param>
    /// <param name="insertChatProjectFileDto">The file name and text.</param>
    Task<ServiceResponse<ChatProjectFileDto>> InsertChatProjectFileAsync(Guid chatProjectId, InsertChatProjectFileDto insertChatProjectFileDto);

    /// <summary>
    /// Deletes an existing chat project file.
    /// </summary>
    /// <param name="chatProjectId">The unique identifier of the project.</param>
    /// <param name="fileId">The unique identifier of the file.</param>
    Task<ServiceResponse<bool>> DeleteChatProjectFileAsync(Guid chatProjectId, Guid fileId);
}
