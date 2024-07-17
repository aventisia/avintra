namespace AccountsAPIs.Services;

public interface ILoginWithPwdService
{

    /// <summary>
    /// Authenticates an individual or tenant's user using the provided username and password.
    /// </summary>
    /// <param name="pwdLoginDto">The login information containing the username and password.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response with the authenticated user information.</returns>
    Task<ServiceResponse<AccountUser>> AuthenticateUserAsync(PwdLoginDto pwdLoginDto);

    /// <summary>
    /// Checks the Two-Factor Authentication (2FA) verification code for the provided username.
    /// </summary>
    /// <param name="checkVerificationCodeDto">The verification code information containing the username and verification code.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response with the verified user information.</returns>
    Task<ServiceResponse<AccountUser>> CheckTwoFAVerificationCodeAsync(CheckVerificationCodeDto checkVerificationCodeDto);
}