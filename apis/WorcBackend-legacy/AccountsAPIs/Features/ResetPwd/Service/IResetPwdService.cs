namespace AccountsAPIs.Services;

public interface IResetPwdService
{
    /// <summary>
    /// Resets the password if the user has forgotten it or is setting it for the first time.
    /// </summary>
    /// <param name="pwdResetDto">The password reset information.</param>
    /// <returns>A task representing the asynchronous operation. The task result contains a service response indicating the success or failure of the password reset.</returns>
    Task<ServiceResponse<bool>> ResetPwdAsync(PwdResetDto pwdResetDto);

    /// <summary>
    /// Logs off from all the sessions if checked by user at time of reset/change pwd
    /// </summary>
    /// <param name="logoffFromAllSessions">A flag indicating whether to log off from all sessions.</param>
    /// <param name="userId">The ID of the user.</param>
    /// <param name="userName">The name of the user.</param>
    /// <param name="currentSessionId">The ID of the current session. (Optional)</param>
    /// <returns>A task representing the asynchronous operation. The task result contains a boolean value indicating whether the logoff was successful.</returns>
    Task<bool> LogoffFromAllSessions(bool logoffFromAllSessions, Guid userId, string userName, string? currentSessionId = null);
}