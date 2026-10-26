namespace AccountsAPIs.Services;

/// <summary>
/// Represents the interface for the authentication service.
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Checks the availability of a email.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the email to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the email is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsEmailAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Validates the username and gets the tenant and its SSO config (if SSO is enabled).
    /// </summary>
    /// <param name="emailDto">The data transfer object containing the email property.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a service response with the tenant information.</returns>
    Task<ServiceResponse<TenantInfoDto>> GetTenantInfoAsync(EmailDto emailDto);

    /// <summary>
    /// Resolves the single sign-on tenant for an email address without requiring the user to exist.
    /// </summary>
    /// <param name="emailDto">The data transfer object containing the email property.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the home realm discovery result.</returns>
    Task<ServiceResponse<SsoDiscoverDto>> DiscoverTenantAsync(EmailDto emailDto);

    /// <summary>
    /// Creates an active user session.
    /// </summary>
    /// <param name="user">The account user.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response with the user session information.</returns>
    Task<ServiceResponse<UserSessionDto>> CreateUserSessionAsync(AccountUser user);

    /// <summary>
    /// Terminates user's sessions based on the provided sessionIds.
    /// </summary>
    /// <param name="userId">The user ID.</param>
    /// <param name="userName">The username.</param>
    /// <param name="howSessionEnded">The reason for session termination.</param>
    /// <param name="sessionIdsParam">The list of session IDs to terminate. If not provided, it terminates expired sessions. If the count is zero and HowSessionEnded is UserHasLoggedOff, it terminates the current session only.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a service response with a boolean value indicating whether the sessions were terminated successfully or not.</returns>
    Task<ServiceResponse<bool>> TerminateUserSessionsAsync(Guid userId, string userName, TerminateSessionReasonsEnum howSessionEnded, List<Guid>? sessionIdsParam = null);

    /// <summary>
    /// Creates a verification code for the provided username and request type.
    /// </summary>
    /// <param name="createVerificationCodeDto">The data transfer object containing the information required to create the verification code.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a service response with the created verification code information.</returns>
    Task<ServiceResponse<CreatedVerificationCodeDto>> CreateVerificationCodeAsync(CreateVerificationCodeDto createVerificationCodeDto);
}