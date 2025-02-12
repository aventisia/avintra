namespace AccountsAPIs.Controllers;

[Route("me"), ApiController, Authorize]
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

    //Update first and last name of the user (request is from MyAcccount)    
    [HttpPost("update-name")]
    public async Task<ActionResult<ServiceResponse<NameUpdateDto>>> UpdateName([FromBody] NameUpdateDto nameUpdateDto)
    {
        return ResultHelper(await _myAccountService.UpdateNameAsync(nameUpdateDto));
    }

    //Update email of the user (request is from MyAcccount) -------Endpoint not tested, should be tested while deployement
    [HttpPost("update-email")]
    public async Task<ActionResult<ServiceResponse<EmailUpdateDto>>> UpdateEmail([FromBody] EmailUpdateDto emailUpdateDto)
    {
        return ResultHelper(await _myAccountService.UpdateEmailAsync(emailUpdateDto));
    }

    //Update two factor authentication of the user (request is from MyAcccount) -------Endpoint not tested, should be tested while deployement
    [HttpPost("toggle-2fa")]
    public async Task<ActionResult<ServiceResponse<Toggle2FADto>>> Toggle2FA([FromBody] Toggle2FADto toggle2FADto)
    {
        return ResultHelper(await _myAccountService.Toggle2FAAsync(toggle2FADto));
    }
    // Gets user's active sessions to view latest user's info
    [HttpGet("active-sessions")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ActiveSessionDto>>>> GetAllActiveSession()
    {
        return ResultHelper(await _myAccountService.GetAllActiveSessionsAsync());
    }

    // Gets user's 2fa-status to view latest user's info
    [HttpGet("2fa-status")]
    public async Task<ActionResult<ServiceResponse<bool>>> GetCurrent2FAStatus()
    {
        return ResultHelper(await _myAccountService.GetCurrent2FAStatusAsync());
    }

    // Deletes an user account.
    [HttpDelete("delete-account")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteUserAccount(DeleteUserAccountDto deleteUserAccountDto)
    {
        return ResultHelper(await _myAccountService.DeleteUserAccountAsync(deleteUserAccountDto));
    }


    // acccounts-api/me/update-profile/
    [HttpPut("update-profile")]
    public async Task<ActionResult<ServiceResponse<UpdateUserProfileDto>>> UpdateUserProfile(UpdateUserProfileDto updateUserProfileDto)
    {
        return ResultHelper(await _myAccountService.UpdateUserProfileAsync(updateUserProfileDto));
    }
    // acccounts-api/me/update-2fa/
    // acccounts-api/me/update-notification-settings/
}