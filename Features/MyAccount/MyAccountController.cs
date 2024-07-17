namespace AccountsAPIs.Controllers;

[Route("me")]
[ApiController]
[Authorize]
public class MyAccountController : BaseApiController
{
    private readonly IAuthService _authService;
    private readonly IMyAccountService _myAccountService;

    public MyAccountController(
        IAuthService authService,
        IMyAccountService myAccountService)
    {
        _authService = authService;
        _myAccountService = myAccountService;
    }

    // Gets user's current session to view latest user's info
    [HttpGet("my-session")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> GetMySession()
    {
        return ResultHelper(await _myAccountService.GetMySessionAsync());
    }

    // Refreshes user session (tokens).
    [AllowAnonymous]
    [HttpPut("refresh-session")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> RefreshSession()
    {
        return ResultHelper(await _myAccountService.RefreshUserSessionAsync());
    }

    // Update user's passwrod after checking old password.
    [HttpPost("update-pwd")]
    public async Task<ActionResult<ServiceResponse<bool>>> UpdatePwd([FromBody] PwdUpdateDto pwdUpdateDto)
    {
        return ResultHelper(await _myAccountService.UpdatePwdAsync(pwdUpdateDto));
    }

    // Logs off from current session for current device
    [HttpPut("logoff")]
    public async Task<ActionResult<ServiceResponse<bool>>> LogOffFromCurrentSession()
    {
        return ResultHelper(await _myAccountService.LogOffFromCurrentSessionAsync());
    }

    // Logoff from sessions basis sessionIds (request is from MyAcccount)
    [HttpPost("terminate-sessions")]
    public async Task<ActionResult<ServiceResponse<bool>>> TerminateUserSelectedSessions([FromBody] TerminateSessionDto terminateSessionDto)
    {
        // Get userId
        var userId = Guid.Parse(this.User.FindFirst("uid")?.Value ?? Guid.Empty.ToString());

        // Get username
        var username = this.User.FindFirst("uname")?.Value ?? "Unknown";

        // Terminate sessions
        var result = await _authService.TerminateUserSessionsAsync(
            userId,
            username,
            terminateSessionDto.HowSessionEnded,
            terminateSessionDto.SessionIdList);

        // Return
        return ResultHelper(result);
    }





    // acccounts-api/me/update-profile/
    // acccounts-api/me/update-2fa/
    // acccounts-api/me/update-notification-settings/
    // acccounts-api/me/terminate-sessions/
}