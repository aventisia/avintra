namespace GlobalAdminAPIs.Controllers;

[Route("onprem/instance-data")]
[ApiController]
[Authorize(Roles = "SA")]
public class OnPremInstanceDataController : BaseApiController
{
    private readonly IOnPremInstanceDataService _OnPremInstanceDataService;

    public OnPremInstanceDataController(IOnPremInstanceDataService OnPremInstanceDataService)
    {
        _OnPremInstanceDataService = OnPremInstanceDataService;
    }

    // Fetch all onPremInstanceData
    [HttpGet("{tenantInstanceId}/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<OnPremInstanceDataDto>>>> GetAllOnPremInstanceData(
    Guid tenantInstanceId,
    [FromQuery] DateTimeOffset? startDate,
    [FromQuery] DateTimeOffset? endDate)
    {
        return ResultHelper(await _OnPremInstanceDataService.GetAllOnPremInstanceDataAsync(tenantInstanceId, startDate, endDate));
    }

    // Fetch OnPremInstanceData by its ID
    [HttpGet("{onPremInstanceDataId}")]
    public async Task<ActionResult<ServiceResponse<OnPremInstanceDataDto>>> GetOnPremInstanceData(Guid onPremInstanceDataId)
    {
        return ResultHelper(await _OnPremInstanceDataService.GetOnPremInstanceDataByIdAsync(onPremInstanceDataId));
    }

    // Create a new OnPremInstanceData
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<OnPremInstanceDataDto>>> InsertOnPremInstanceData([FromBody] OnPremInstanceDataDto onPremInstanceDataDto)
    {
        return ResultHelper(await _OnPremInstanceDataService.InsertOnPremInstanceDataAsync(onPremInstanceDataDto));
    }

    // Update an existing OnPremInstanceData
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<OnPremInstanceDataDto>>> UpdateOnPremInstanceData([FromBody] OnPremInstanceDataDto onPremInstanceDataDto)
    {
        return ResultHelper(await _OnPremInstanceDataService.UpdateOnPremInstanceDataAsync(onPremInstanceDataDto));
    }

    // Delete an OnPremInstanceData by ID
    [HttpDelete("{onPremInstanceDataId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteOnPremInstanceData(Guid onPremInstanceDataId)
    {
        return ResultHelper(await _OnPremInstanceDataService.DeleteOnPremInstanceDataAsync(onPremInstanceDataId));
    }

    // Delete multiple OnPremInstanceData by IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleOnPremInstanceData([FromBody] IEnumerable<Guid> onPremInstanceDataIds)
    {
        return ResultHelper(await _OnPremInstanceDataService.DeleteMultipleOnPremInstanceDataAsync(onPremInstanceDataIds));
    }
}
