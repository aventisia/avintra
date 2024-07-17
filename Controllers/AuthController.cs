namespace AccountsAPIs.Controllers;

[Route("auth")]
[ApiController]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // Checks if an email already exists in the database while creating account or updating username.
    [HttpPost("does-email-exist")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> DoesEmailExist([FromBody] EmailDto emailDto)
    {
        return Ok(await _authService.DoesEmailExistAsync(emailDto));
    }

    // Validates username and Gets tenant and its SSO config (if SSO is enabled)
    [HttpPost("tenant-info")]
    public async Task<ActionResult<ServiceResponse<TenantInfoDto>>> GetTenantInfo([FromBody] EmailDto emailDto)
    {
        // Fetch tenant info
        var tenantInfoResult = await _authService.GetTenantInfoAsync(
            emailDto);

        // Returns tenant info
        return ResultHelper(tenantInfoResult);
    }

    // Creates a verification code for the provided username and request type.
    [HttpPost("create-code")]
    public async Task<ActionResult<ServiceResponse<CreatedVerificationCodeDto>>> CreateVerificationCode([FromBody] CreateVerificationCodeDto createVerificationCodeDto)
    {
        // If request type is TwoFA or UpdatePwd
        if (createVerificationCodeDto.RequestType == VerificationCodeRequestTypesEnum.TwoFA ||
            createVerificationCodeDto.RequestType == VerificationCodeRequestTypesEnum.UpdatePwd)
            return Forbid("Request type is not allowed");

        // Request type is not defined  in enum
        if (!Enum.IsDefined(typeof(VerificationCodeRequestTypesEnum), createVerificationCodeDto.RequestType))
            return Forbid("Request type is not allowed");

        return Ok(await _authService.CreateVerificationCodeAsync(createVerificationCodeDto));
    }
}