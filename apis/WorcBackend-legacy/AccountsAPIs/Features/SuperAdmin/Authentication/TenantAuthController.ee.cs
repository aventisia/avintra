namespace AccountsAPIs.Controllers;

[Route("sa/tenants/auth")]
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
    [HttpPost("tokens")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> GenerateTenantToken()
    {
        return ResultHelper(await _tenantAuthService.CreateSessionAsync());
    }

    // Refreshes user session (tokens).
    [AllowAnonymous]
    [HttpPut("tokens/refresh")]
    public async Task<ActionResult<ServiceResponse<UserSessionDto>>> RefreshSession()
    {
        return ResultHelper(await _tenantAuthService.RefreshSessionAsync());
    }
}