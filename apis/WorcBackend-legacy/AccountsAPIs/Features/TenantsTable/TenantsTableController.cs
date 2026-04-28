namespace AccountsAPIs.Controllers;

[Route("tenant")]
[ApiController]
[Authorize(Roles = "SA")]
public class TenantsTableController : BaseApiController
{
    private readonly ITenantsTableService _tenantsTableService;

    public TenantsTableController(ITenantsTableService tenantsTableService)
    {
        _tenantsTableService = tenantsTableService;
    }

    // Retrieves all tenants.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TenantsTableDto>>>> GetTenants([FromQuery] TenantFilterQuery tenantFilterQuery)
    {
        return ResultHelper(await _tenantsTableService.GetTenantsAsync(tenantFilterQuery));
    }

    // Retrieves all tenants.
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<TenantsTableDto>>> GetTenant(Guid? id)
    {
        return ResultHelper(await _tenantsTableService.GetTenantAsync(id));
    }

    // Retrieves a list of tenant options.
    [HttpGet("tenants-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOptionDto>>>> GetTenantOptionListAsync(TenantTypesEnum? tenantType)
    {
        return ResultHelper(await _tenantsTableService.GetTenantOptionListAsync(tenantType));
    }

    // Retrieves a list of tenant options.
    [HttpPost("tenants-to-search-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOptionDto>>>> SearchTenantOptionList(SearchSelectOptionDto searchOptionDto)
    {
        return ResultHelper(await _tenantsTableService.SearchTenantOptionListAsync(searchOptionDto));
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

    // Deletes a tenant by its ID (tenantId in the query parameters)
    [HttpDelete("records")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTenant([FromQuery] Guid tenantId)
    {
        return ResultHelper(await _tenantsTableService.DeleteTenantAsync(tenantId));
    }

    // Disable multiple tenants by their IDs.
    [HttpPost("disable-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DisableTenants([FromBody] List<Guid> ids)
    {
        return ResultHelper(await _tenantsTableService.DisableTenantsAsync(ids));
    }
}