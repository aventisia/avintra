namespace AccountsAPIs.Services;

public interface IMyAccountService
{
    /// <summary>
    /// Gets user's current session without JWT to view latest user's info
    /// </summary>
    /// <returns>User's current session info without JWT</returns>
    Task<ServiceResponse<UserSessionDto>> GetMySessionAsync();

    /// <summary>
    /// Logs off from current session for current device
    /// </summary>
    Task<ServiceResponse<bool>> LogOffFromCurrentSessionAsync();

    /// <summary>
    /// Refreshes the user's session for the requested device.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response with the refreshed user session information.</returns>
    Task<ServiceResponse<UserSessionDto>> RefreshUserSessionAsync();

    /// <summary>
    /// Update user's passwrod after checking old password.
    /// </summary>
    /// <param name="pwdUpdateDto">The password update DTO.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response indicating whether the password update was successful or not.</returns>
    Task<ServiceResponse<bool>> UpdatePwdAsync(PwdUpdateDto pwdUpdateDto);

    /// <summary>
    /// Gets user's active sessions to view latest user's info
    /// </summary>
    /// <returns>User's active session info without JWT</returns>
    Task<ServiceResponse<IEnumerable<ActiveSessionDto>>> GetAllActiveSessionsAsync();

    /// <summary>
    /// Gets user's 2fa-status to view latest user's info
    /// </summary>
    Task<ServiceResponse<bool>> GetCurrent2FAStatusAsync();

    // <summary>
    /// Deletes an user account.
    /// </summary>
    /// <param name="id">The ID of the user  account to delete.</param>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> indicating the success or failure of the operation.</returns>
    Task<ServiceResponse<bool>> DeleteUserAccountAsync(DeleteUserAccountDto deleteUserAccountDto);

    /// <summary>
    /// Update user's first and last name
    /// </summary>
    /// <param name="nameUpdateDto">the name update dto</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response indicating whether the name update was successful or not.</returns>
    Task<ServiceResponse<NameUpdateDto>> UpdateNameAsync(NameUpdateDto nameUpdateDto);

    /// <summary>
    /// Update user's email
    /// </summary>
    /// <param name="emailUpdateDto">the email update dto</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response indicating whether the email update was successful or not.</returns>
    Task<ServiceResponse<EmailUpdateDto>> UpdateEmailAsync(EmailUpdateDto emailUpdateDto);


    /// <summary>
    /// Update user's two factor authentication
    /// </summary>
    /// <param name="toggle2FADto">the toggle 2FA Dto</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response indicating whether user's two factor authentication update was successful or not.</returns>
    Task<ServiceResponse<Toggle2FADto>> Toggle2FAAsync(Toggle2FADto toggle2FADto);

    /// <summary>
    /// Update user's profile details
    /// </summary>
    /// <param name="updateUserProfileDto">the profile update dto</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response indicating whether the profile details update was successful or not.</returns>
    Task<ServiceResponse<UserProfileDto>> UpdateUserProfileAsync(UserProfileDto updateUserProfileDto);

    /// <summary>
    /// get user profile information
    /// </summary>
    /// <param name="userId">user uniqueid</param>
    /// <returns></returns>
    Task<ServiceResponse<UserProfileDto>> GetUserProfileAsync();

    // acccounts-api/me/update-2fa/
    // acccounts-api/me/update-notification-settings/
    // acccounts-api/me/terminate-session/


}