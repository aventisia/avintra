namespace AccountsAPIs.Controllers;

[Route("auth")]
[ApiController]
public class LoginWithExternalAuthController : BaseApiController
{
    private readonly ILoginWithExternalAuthService _loginWithExternalAuthService;
    private readonly IAuthService _authService;

    public LoginWithExternalAuthController(
        ILoginWithExternalAuthService loginWithExternalAuthService, IAuthService authService)
    {
        _loginWithExternalAuthService = loginWithExternalAuthService;
        _authService = authService;
    }

    // Generates an authentication URL for a specified external provider (Azure, Google, Facebook, Twitter).
    [HttpGet("entra/login-url")]
    public ActionResult<ServiceResponse<string>> GenerateLoginUrl(ExternalAuthProviderEnum type, string? email)
    {
        return ResultHelper(_loginWithExternalAuthService.GenerateLoginUrlAsync(type, email, Guid.Empty));
    }

    // Validates an external token and creates the user if not already existing.
    [HttpGet("entra/token")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> EntraToken(string code, string? state)
    {
        // Validate the token and create the user if it doesn't exist
        var authenticateUserResult = await _loginWithExternalAuthService.EntraTokenAsync(code, state);

        // Return the mapped client or server error when authentication did not succeed
        if (authenticateUserResult.StatusCode != 200 || authenticateUserResult.Data == null)
        {
            var errorStatusCode = authenticateUserResult.StatusCode is >= 400 and < 600
                ? authenticateUserResult.StatusCode
                : 401;

            return PlainTextError(errorStatusCode, authenticateUserResult.Message);
        }

        // Delete any expired sessions for the authenticated user
        var terminateUserExpiredSessionsResult = await _authService.TerminateUserSessionsAsync(
            authenticateUserResult.Data.Id,
            authenticateUserResult.Data.UserName,
            TerminateSessionReasonsEnum.SessionHasExpired);

        // Delete failed - return plain text
        if (terminateUserExpiredSessionsResult.StatusCode != 200)
            return ResultHelper(terminateUserExpiredSessionsResult);

        // Create a new user session for the authenticated user
        var createUserSessionResult = await _authService.CreateUserSessionAsync(authenticateUserResult.Data);

        // Return the user session information to the client
        return ResultHelper(createUserSessionResult);
    }
}
