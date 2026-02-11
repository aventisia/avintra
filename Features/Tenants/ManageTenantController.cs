namespace MLModelBuilderAPIs.Controllers;

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

    // Deletes a tenant
    [HttpDelete("tenant")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTenant()
    {
        return ResultHelper(await _manageTenantService.DeleteTenantAsync());
    }
}