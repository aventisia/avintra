namespace AccountsAPIs.Controllers;

[Route("tenant")]
[ApiController]
[Authorize(Roles = "SA,GA")]
public class TenantsTableController : BaseApiController
{
    private readonly ITenantsTableService _tenantsTableService;

    public TenantsTableController(ITenantsTableService tenantsTableService)
    {
        _tenantsTableService = tenantsTableService;
    }

    // Retrieves all tenants.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TenantsTableDto>>>> GetTenants()
    {
        return ResultHelper(await _tenantsTableService.GetTenantsAsync());
    }

    // Checks the availability of a tenant name.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsTenantNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _tenantsTableService.IsTenantNameAvailableAsync(checkAvailabilityDto));
    }

    // Inserts a new tenant.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<TenantsTableDto>>> InsertTenant([FromBody] TenantsTableDto tenantsTableDto)
    {
        return ResultHelper(await _tenantsTableService.InsertTenantAsync(tenantsTableDto));
    }

    // Updates an existing tenant.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<TenantsTableDto>>> UpdateTenant([FromBody] TenantsTableDto tenantsTableDto)
    {
        return ResultHelper(await _tenantsTableService.UpdateTenantAsync(tenantsTableDto));
    }

    // Deletes a tenant by its ID.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTenant(Guid id)
    {
        return ResultHelper(await _tenantsTableService.DeleteTenantAsync(id));
    }

    // Disable multiple tenants by their IDs.
    [HttpPost("disable-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DisableTenants([FromBody] List<Guid> ids)
    {
        return ResultHelper(await _tenantsTableService.DisableTenantsAsync(ids));
    }
}