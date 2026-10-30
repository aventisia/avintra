namespace GlobalAdminAPIs.Controllers;

[Route("onprem/instance")]
[ApiController]
[Authorize(Roles = "SA")]
public class OnPremInstanceController : BaseApiController
{
    private readonly IOnPremInstanceService _OnPremInstanceService;

    public OnPremInstanceController(IOnPremInstanceService OnPremInstanceService)
    {
        _OnPremInstanceService = OnPremInstanceService;
    }

    // Checks if the OnPremInstance name is available for the given tenant
    [HttpPost("{onPremTenantId}/is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsOnPremInstanceNameAvailable(Guid onPremTenantId, [FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _OnPremInstanceService.IsOnPremInstanceNameAvailableAsync(onPremTenantId, checkAvailabilityDto));
    }

    // Fetch all OnPremInstances
    [HttpGet("{onPremTenantId}/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<OnPremInstanceDto>>>> GetAllOnPremInstances(Guid onPremTenantId)
    {
        return ResultHelper(await _OnPremInstanceService.GetAllOnPremInstancesAsync(onPremTenantId));
    }

    // Fetch OnPremInstance by its ID
    [HttpGet("{OnPremInstanceId}")]
    public async Task<ActionResult<ServiceResponse<OnPremInstanceDto>>> GetOnPremInstance(Guid OnPremInstanceId)
    {
        return ResultHelper(await _OnPremInstanceService.GetOnPremInstanceAsync(OnPremInstanceId));
    }

    // Fetch OnPremInstance by its name
    [HttpGet("name/{OnPremInstanceName}")]
    public async Task<ActionResult<ServiceResponse<OnPremInstanceDto>>> GetOnPremInstanceByName(string OnPremInstanceName)
    {
        return ResultHelper(await _OnPremInstanceService.GetOnPremInstanceByNameAsync(OnPremInstanceName));
    }

    // Create a new OnPremInstance
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<OnPremInstanceDto>>> InsertOnPremInstance([FromBody] OnPremInstanceDto OnPremInstanceDto)
    {
        return ResultHelper(await _OnPremInstanceService.InsertOnPremInstanceAsync(OnPremInstanceDto));
    }

    // Update an existing OnPremInstance
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<OnPremInstanceDto>>> UpdateOnPremInstance([FromBody] OnPremInstanceDto OnPremInstanceDto)
    {
        return ResultHelper(await _OnPremInstanceService.UpdateOnPremInstanceAsync(OnPremInstanceDto));
    }

    // Delete an OnPremInstance by ID
    [HttpDelete("{OnPremInstanceId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteOnPremInstance(Guid OnPremInstanceId)
    {
        return ResultHelper(await _OnPremInstanceService.DeleteOnPremInstanceAsync(OnPremInstanceId));
    }

    // Delete multiple OnPremInstances by IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleOnPremInstances([FromBody] IEnumerable<Guid> OnPremInstanceIds)
    {
        return ResultHelper(await _OnPremInstanceService.DeleteMultipleOnPremInstancesAsync(OnPremInstanceIds));
    }

    // Search OnPremInstances by name
    [HttpGet("search/{OnPremInstanceName}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<OnPremInstanceDto>>>> SearchOnPremInstancesByName(string OnPremInstanceName)
    {
        return ResultHelper(await _OnPremInstanceService.SearchOnPremInstancesByNameAsync(OnPremInstanceName));
    }

    // Retrieves the statistics for a specific on-premises tenant instance by its unique identifier
    [HttpGet("{onPremInstanceId}/statistics")]
    public async Task<ActionResult<ServiceResponse<OnpremInstanceStaticDto>>> GetOnPremInstanceStats(Guid onPremInstanceId)
    {
        return ResultHelper(await _OnPremInstanceService.GetOnPremInstanceStatsAsync(onPremInstanceId));
    }

    // Retrieves the statistics for a specific on-premises tenant instance by its name
    [HttpGet("statistics/by-name/{tenantInstanceName}")]
    public async Task<ActionResult<ServiceResponse<OnpremInstanceStaticDto>>> GetOnPremInstanceStatsByName(string tenantInstanceName)
    {
        return ResultHelper(await _OnPremInstanceService.GetOnPremInstanceStatsByNameAsync(tenantInstanceName));
    }
}