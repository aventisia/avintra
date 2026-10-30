namespace GlobalAdminAPIs.Controllers;

[Route("onprem-tenant")]
[ApiController]
[Authorize(Roles = "SA")]
public class OnPremTenantController : BaseApiController
{
    private readonly IOnPremTenantService _onPremTenantService;

    public OnPremTenantController(IOnPremTenantService onPremTenantService)
    {
        _onPremTenantService = onPremTenantService;
    }

    // Checks the availability of an OnPremTenant name
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsTenantNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _onPremTenantService.IsOnPremTenantNameAvailableAsync(checkAvailabilityDto));
    }

    // Fetch all OnPremTenants
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<OnPremTenantDto>>>> GetAllOnPremTenants()
    {
        return ResultHelper(await _onPremTenantService.GetAllOnPremTenantsAsync());
    }

    // Fetch OnPremTenant by its ID
    [HttpGet("{onPremTenantId}")]
    public async Task<ActionResult<ServiceResponse<OnPremTenantDto>>> GetOnPremTenant(Guid onPremTenantId)
    {
        return ResultHelper(await _onPremTenantService.GetOnPremTenantAsync(onPremTenantId));
    }

    // Fetch OnPremTenant by its name
    [HttpGet("name/{onPremTenantName}")]
    public async Task<ActionResult<ServiceResponse<OnPremTenantDto>>> GetOnPremTenantByName(string onPremTenantName)
    {
        return ResultHelper(await _onPremTenantService.GetOnPremTenantByNameAsync(onPremTenantName));
    }

    // Create a new OnPremTenant
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<OnPremTenantDto>>> InsertOnPremTenant([FromBody] OnPremTenantDto onPremTenantDto)
    {
        return ResultHelper(await _onPremTenantService.InsertOnPremTenantAsync(onPremTenantDto));
    }

    // Update an existing OnPremTenant
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<OnPremTenantDto>>> UpdateOnPremTenant([FromBody] OnPremTenantDto onPremTenantDto)
    {
        return ResultHelper(await _onPremTenantService.UpdateOnPremTenantAsync(onPremTenantDto));
    }

    // Delete an OnPremTenant by ID
    [HttpDelete("{onPremTenantId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteOnPremTenant(Guid onPremTenantId)
    {
        return ResultHelper(await _onPremTenantService.DeleteOnPremTenantAsync(onPremTenantId));
    }

    // Delete multiple OnPremTenants by IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleOnPremTenants([FromBody] IEnumerable<Guid> onPremTenantIds)
    {
        return ResultHelper(await _onPremTenantService.DeleteMultipleOnPremTenantsAsync(onPremTenantIds));
    }

    // Search OnPremTenants by name
    [HttpGet("search/{onPremTenantName}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<OnPremTenantDto>>>> SearchOnPremTenantsByName(string onPremTenantName)
    {
        return ResultHelper(await _onPremTenantService.SearchOnPremTenantsByNameAsync(onPremTenantName));
    }

    // Retrieves the statistics for a specific on-premises tenant by its unique tenant identifier
    [HttpGet("{onPremTenantId}/statistics")]
    public async Task<ActionResult<ServiceResponse<OnpremInstanceStaticDto>>> GetOnPremTenantStatsById(Guid onPremTenantId)
    {
        return ResultHelper(await _onPremTenantService.GetOnPremTenantStatsByIdAsync(onPremTenantId));
    }

    // Retrieves the statistics for a specific on-premises tenant by its tenant name
    [HttpGet("statistics/by-name/{onPremTenantName}")]
    public async Task<ActionResult<ServiceResponse<OnpremInstanceStaticDto>>> GetOnPremTenantStatsByName(string onPremTenantName)
    {
        return ResultHelper(await _onPremTenantService.GetOnPremTenantStatsByNameAsync(onPremTenantName));
    }
}