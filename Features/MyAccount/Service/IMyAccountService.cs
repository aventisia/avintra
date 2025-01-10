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

    // acccounts-api/me/update-profile/
    // acccounts-api/me/update-2fa/
    // acccounts-api/me/update-notification-settings/
    // acccounts-api/me/terminate-session/
}