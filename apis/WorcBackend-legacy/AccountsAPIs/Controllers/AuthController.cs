namespace AccountsAPIs.Controllers;

[Route("auth")]
[ApiController]
public class AuthController(IAuthService authService) : BaseApiController
{
    private readonly IAuthService _authService = authService;

    // Checks the availability of a email.
    [HttpPost("is-email-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsEmailAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _authService.IsEmailAvailableAsync(checkAvailabilityDto));
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

    // Resolves the single sign-on tenant for an email address (home realm discovery).
    [HttpPost("discover")]
    public async Task<ActionResult<ServiceResponse<SsoDiscoverDto>>> DiscoverTenant([FromBody] EmailDto emailDto)
    {
        // Fetch the home realm discovery result
        var discoverResult = await _authService.DiscoverTenantAsync(emailDto);

        // Returns the discovery result
        return ResultHelper(discoverResult);
    }

    // Creates a verification code for the provided username and request type.
    [HttpPost("create-code")]
    public async Task<ActionResult<ServiceResponse<CreatedVerificationCodeDto>>> CreateVerificationCode([FromBody] CreateVerificationCodeDto createVerificationCodeDto)
    {
        // If request type is TwoFA or UpdatePwd
        if (createVerificationCodeDto.RequestType == VerificationCodeRequestTypesEnum.TwoFA ||
            createVerificationCodeDto.RequestType == VerificationCodeRequestTypesEnum.UpdatePwd)
            return PlainTextError(403, "Request type is not allowed");

        // Request type is not defined  in enum
        if (!Enum.IsDefined(typeof(VerificationCodeRequestTypesEnum), createVerificationCodeDto.RequestType))
            return PlainTextError(403, "Request type is not allowed");

        return ResultHelper(await _authService.CreateVerificationCodeAsync(createVerificationCodeDto));
    }
}