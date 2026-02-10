namespace MLModelBuilderAPIs.Controllers;

[Route("tenant")]
[ApiController]
[Authorize(Roles = "SA")]
public class TenantTableController : BaseApiController
{
    private readonly ITenantTableService _tenantTableService;

    public TenantTableController(ITenantTableService tenantTableService)
    {
        _tenantTableService = tenantTableService;
    }

    // Deletes a tenant by its ID (tenantId in the query parameters)
    [HttpDelete("records")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTenant([FromQuery] Guid tenantId)
    {
        return ResultHelper(await _tenantTableService.DeleteTenantAsync(tenantId));
    }
}
