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

    // acccounts-api/me/update-profile/
    // acccounts-api/me/update-2fa/
    // acccounts-api/me/update-notification-settings/
    // acccounts-api/me/terminate-session/
}