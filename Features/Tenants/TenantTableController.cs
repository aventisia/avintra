namespace WorkspaceAPIs.Controllers;

[Route("tenant")]
[ApiController]
public class TenantTableController : BaseApiController
{
    private readonly ITenantTableService _tenantTableService;

    public TenantTableController(ITenantTableService tenantTableService)
    {
        _tenantTableService = tenantTableService;
    }

    // Deletes a tenant by its ID
    [HttpDelete("{tenantId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTenant(Guid tenantId)
    {
        return ResultHelper(await _tenantTableService.DeleteTenantAsync(tenantId));
    }
}
