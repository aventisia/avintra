namespace AccountsAPIs.Controllers;

[AllowAnonymous]
[Route("branding")]
[ApiController]
public class BrandingController : BaseApiController
{
    private readonly IBrandingService _brandingService;

    public BrandingController(IBrandingService brandingService)
    {
        _brandingService = brandingService;
    }

    // Retrieves the deployment's branding configuration.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<BrandingDto>>> GetBranding()
    {
        return ResultHelper(await _brandingService.GetBrandingAsync());
    }
}
