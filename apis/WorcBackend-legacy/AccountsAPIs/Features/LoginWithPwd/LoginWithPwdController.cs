namespace AccountsAPIs.Controllers;

[Route("auth")]
[ApiController]
public class LoginWithPwdController : BaseApiController
{
    private readonly ILoginWithPwdService _loginWithPwdService;
    private readonly IAuthService _authService;

    public LoginWithPwdController(
        ILoginWithPwdService loginWithPwdService, IAuthService authService)
    {
        _loginWithPwdService = loginWithPwdService;
        _authService = authService;
    }

    // Authenticates an individual or tenant's user using the provided username and password.
    [HttpPost("login")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> AuthenticateUser([FromBody] PwdLoginDto pwdLoginDto)
    {
        // Authenticate user
        var authenticateUserResult = await _loginWithPwdService.AuthenticateUserAsync(pwdLoginDto);

        // Bad request
        if (authenticateUserResult.StatusCode == 400)
            return PlainTextError(400, authenticateUserResult.Message);

        // User is unautherized
        if (authenticateUserResult.StatusCode == 401)
            return PlainTextError(401, authenticateUserResult.Message);

        // Return here if Password has expired
        if (authenticateUserResult.Message.Contains("Your password has been expired"))
        {
            authenticateUserResult.Data = null;
            return ResultHelper(authenticateUserResult);
        }

        /*TwoFA verification code has to be created here only bcz after checking TwoFA code
        user will be able to get Jwt to do anything so this TwoFA verification should not
        be allowed from frontend side. Also condition has been applied in "create-code"
        endpoint to not allow TwoFA request type*/
        // TwoFA is enabled
        if (authenticateUserResult.Message.Contains("TwoFA is enabled"))
        {
            var createVerificationCodeResult = await _authService.CreateVerificationCodeAsync(new CreateVerificationCodeDto()
            {
                Email = pwdLoginDto.Email,
                RequestType = VerificationCodeRequestTypesEnum.TwoFA
            });

            // Replacing the message with "TwoFA is enabled" as it has to match on client side
            createVerificationCodeResult.Message = "TwoFA is enabled";

            return ResultHelper(createVerificationCodeResult);
        }

        // Delete expired sessions
        var terminateUserExpiredSessionsResult = await _authService.TerminateUserSessionsAsync(
            authenticateUserResult.Data.Id,
            authenticateUserResult.Data.UserName,
            TerminateSessionReasonsEnum.SessionHasExpired);

        // Delete-ExpiredSessions job failed
        if (terminateUserExpiredSessionsResult.StatusCode != 200)
            return ResultHelper(terminateUserExpiredSessionsResult);

        // Create UserSessionDto
        var createUserSessionResult = await _authService.CreateUserSessionAsync(authenticateUserResult.Data);

        // Returns UserSessionDto
        return ResultHelper(createUserSessionResult);
    }

    // Checks the Two-Factor Authentication (2FA) verification code for the provided username.
    [HttpPost("verify-2fa-code")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> CheckTwoFAVerificationCode([FromBody] CheckVerificationCodeDto checkVerificationCodeDto)
    {
        // Authenticate user
        var authenticateUserResult = await _loginWithPwdService.CheckTwoFAVerificationCodeAsync(
            checkVerificationCodeDto);

        // Bad request
        if (authenticateUserResult.StatusCode == 400)
            return PlainTextError(400, authenticateUserResult.Message);

        // User is unautherized
        if (authenticateUserResult.StatusCode == 401)
            return PlainTextError(401, authenticateUserResult.Message);

        // Delete expired sessions
        var terminateUserExpiredSessionsResult = await _authService.TerminateUserSessionsAsync(
            authenticateUserResult.Data.Id,
            authenticateUserResult.Data.UserName,
            TerminateSessionReasonsEnum.SessionHasExpired);

        // Delete-ExpiredSessions job failed
        if (terminateUserExpiredSessionsResult.StatusCode != 200)
            return ResultHelper(terminateUserExpiredSessionsResult);

        // Create UserSessionDto
        var userSessionDto = await _authService.CreateUserSessionAsync(authenticateUserResult.Data);

        // Returns UserSessionDto
        return ResultHelper(userSessionDto);
    }
}