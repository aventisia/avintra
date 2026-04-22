namespace AccountsAPIs.Controllers;

[Route("sa/auth")]
[ApiController]
[Authorize(Roles = "SA")]

public class TenantAuthController : BaseApiController
{
    private readonly ITenantAuthService _tenantAuthService;

    public TenantAuthController(ITenantAuthService tenantAuthService)
    {
        _tenantAuthService = tenantAuthService;
    }

    // Generates a token for a specific tenant
    [HttpPost("tenant/token")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> GenerateTenantToken(TenantTokenDto tenantTokenDto)
    {
        return ResultHelper(await _tenantAuthService.GenerateTenantTokenAsync(tenantTokenDto));
    }
}