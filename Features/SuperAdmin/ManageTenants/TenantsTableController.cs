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
}