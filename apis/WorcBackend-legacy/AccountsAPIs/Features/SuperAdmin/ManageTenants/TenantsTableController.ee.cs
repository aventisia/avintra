namespace AccountsAPIs.Controllers;

[Route("sa")]
[ApiController]
[Authorize(Roles = "SA")]
public class ManageTenantController : BaseApiController
{
    private readonly IManageTenantService _manageTenantService;

    public ManageTenantController(IManageTenantService manageTenantService)
    {
        _manageTenantService = manageTenantService;
    }

    // Deletes a tenant by its ID (tenantId in the query parameters)
    [HttpDelete("tenant")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTenant()
    {
        return ResultHelper(await _manageTenantService.DeleteTenantAsync());
    }

    // Gets the support configuration for a tenant.
    [HttpGet("tenants/{tenantId}/support-config")]
    public async Task<ActionResult<ServiceResponse<TenantSupportConfigDto>>> GetTenantSupportConfig(Guid tenantId)
    {
        return ResultHelper(await _manageTenantService.GetTenantSupportConfigAsync(tenantId));
    }

    // Updates the support configuration for a tenant.
    [HttpPut("tenants/{tenantId}/support-config")]
    public async Task<ActionResult<ServiceResponse<TenantSupportConfigDto>>> UpdateTenantSupportConfig(Guid tenantId, [FromBody] TenantSupportConfigDto configDto)
    {
        return ResultHelper(await _manageTenantService.UpdateTenantSupportConfigAsync(tenantId, configDto));
    }
}