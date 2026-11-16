using WorkspaceAPIs.Features.Chats.UserChatProfile.DTOs;

namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for managing the signed-in user's chat custom instructions and memory notes.
/// </summary>
public interface IUserChatProfileService
{
    /// <summary>
    /// Retrieves the signed-in user's chat profile, or an empty profile when none is saved.
    /// </summary>
    /// <returns>A service response containing the profile.</returns>
    Task<ServiceResponse<UserChatProfileDto>> GetUserChatProfileAsync();

    /// <summary>
    /// Saves the signed-in user's chat profile, creating it on first save.
    /// </summary>
    /// <param name="updateUserChatProfileDto">The instructions and memory notes to store.</param>
    /// <returns>A service response containing the saved profile.</returns>
    Task<ServiceResponse<UserChatProfileDto>> UpdateUserChatProfileAsync(UpdateUserChatProfileDto updateUserChatProfileDto);
}
