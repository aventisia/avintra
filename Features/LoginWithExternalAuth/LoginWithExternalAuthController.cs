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
    [HttpGet("generate-login-url")]
    public IActionResult GenerateLoginUrl(ExternalAuthProviderEnum type, string redirectUrl)
    {
        return ResultHelper(_loginWithExternalAuthService.GenerateLoginUrlAsync(type, redirectUrl));
    }

    // Validates an external token and creates the user if not already existing.
    [HttpPost("validate-token")]
    public async Task<IActionResult> GenerateLoginUrl([FromBody] ValidateTokenRequestDto requestDto)
    {
        // Validate the token and create the user if it doesn't exist
        var authenticateUserResult = await _loginWithExternalAuthService.ValidateTokenAndCreateUserAsync(requestDto);

        // Return BadRequest if token validation fails due to domain mismatch or other client error
        if (authenticateUserResult.StatusCode == 400)
            return BadRequest(authenticateUserResult.Message);

        // Return Unauthorized if the token is invalid or user is unauthorized
        if (authenticateUserResult.StatusCode == 401)
            return Unauthorized(authenticateUserResult.Message);

        // Delete any expired sessions for the authenticated user
        var terminateUserExpiredSessionsResult = await _authService.TerminateUserSessionsAsync(
            authenticateUserResult.Data.Id,
            authenticateUserResult.Data.UserName,
            TerminateSessionReasonsEnum.SessionHasExpired);

        // Return BadRequest if deleting expired sessions failed
        if (terminateUserExpiredSessionsResult.StatusCode == 400)
            return BadRequest(terminateUserExpiredSessionsResult.Message);

        // Create a new user session for the authenticated user
        var createUserSessionResult = await _authService.CreateUserSessionAsync(authenticateUserResult.Data);

        // Return the user session information to the client
        return ResultHelper(createUserSessionResult);
    }
}
