namespace AccountsAPIs.Controllers;

[Route("auth")]
[ApiController]
public class VerificationCodeController : BaseApiController
{
    private readonly IVerificationCodeService _verificationCodeService;

    public VerificationCodeController(IVerificationCodeService verificationCodeService)
    {
        _verificationCodeService = verificationCodeService;
    }

    // Note: create-code is part of common AuthService and AuthController

    // Checks the verification code for the provided username and request type (except "ResetPwd").
    [HttpPost("verify-code")]
    public async Task<ActionResult<ServiceResponse<bool>>> CheckVerificationCode([FromBody] CheckVerificationCodeDto checkVerificationCodeDto)
    {
        return ResultHelper(await _verificationCodeService.CheckVerificationCodeAsync(checkVerificationCodeDto));
    }
}