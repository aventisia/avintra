namespace AccountsAPIs.Controllers;

[Route("auth")]
[ApiController]
[Authorize]
public class ResetPwdController(IResetPwdService resetPwdService) : BaseApiController
{
    private readonly IResetPwdService _resetPwdService = resetPwdService;

    // Resets the password if the user has forgotten it or is setting it for the first time.

    [HttpPost("reset-pwd")]
    public async Task<ActionResult<ServiceResponse<bool>>> ResetPwd([FromBody] PwdResetDto pwdResetDto)
    {
        // Returns resetPwdResult
        return ResultHelper(await _resetPwdService.ResetPwdAsync(pwdResetDto));
    }
}