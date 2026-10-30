namespace GlobalAdminAPIs.Controllers;

[Route("onprem/instance")]
[ApiController]
[TenantAuth]
public class OnPremInstanceValidationController : BaseApiController
{
    private readonly IOnPremInstanceValidationService _OnPremInstanceValidationService;

    public OnPremInstanceValidationController(IOnPremInstanceValidationService OnPremInstanceValidationService)
    {
        _OnPremInstanceValidationService = OnPremInstanceValidationService;
    }

    // Get on-prem tenant and instance metadata
    [HttpGet("metadata")]
    public async Task<ActionResult<ServiceResponse<OnPremDeploymentMetaDataDto>>> GetOnPremInstanceMetadata()
    {
        return ResultHelper(await _OnPremInstanceValidationService.GetOnPremInstanceMetadataAsync());
    }

    // Create a new OnPremInstanceValidation
    [HttpPost("validate")]
    public async Task<ActionResult<ServiceResponse<OnPremInstanceResponseDto>>> ValidateAndSaveInstance([FromBody] OnPremInstanceRequestDto onPremInstanceRequestDto)
    {
        return ResultHelper(await _OnPremInstanceValidationService.ValidateAndSaveInstanceAsync(onPremInstanceRequestDto));
    }

}
