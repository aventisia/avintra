namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("flowversion-user")]
public class FlowVersionUserController : BaseApiController
{
    private readonly IFlowVersionUserService _flowVersionUserService;

    public FlowVersionUserController(IFlowVersionUserService flowVersionUserService)
    {
        _flowVersionUserService = flowVersionUserService;
    }

    // Get flow versions for current user
    [HttpGet("my")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowVersionUserDto>>>> GetMyFlowVersions()
    {
        return ResultHelper(await _flowVersionUserService.GetMyFlowVersionsAsync());
    }

    // Get users for a specific flow version
    [HttpGet("{flowVersionId}/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowVersionUserDto>>>> GetFlowVersionUsersAsync(Guid flowVersionId)
    {
        return ResultHelper(await _flowVersionUserService.GetFlowVersionUsersAsync(flowVersionId));
    }

    // Get a specific flow version user by ID
    [HttpGet("{flowVersionUserId}")]
    public async Task<ActionResult<ServiceResponse<FlowVersionUserDto>>> GetFlowVersionUserAsync(Guid flowVersionUserId)
    {
        return ResultHelper(await _flowVersionUserService.GetFlowVersionUserByIdAsync(flowVersionUserId));
    }

    // Create a new flow version user
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FlowVersionUserDto>>> CreateFlowVersionUserAsync([FromBody] FlowVersionUserDto flowVersionUserDto)
    {
        return ResultHelper(await _flowVersionUserService.InsertFlowVersionUserAsync(flowVersionUserDto));
    }

    // Bulk create flow version users
    [HttpPost("bulk")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowVersionUserDto>>>> BulkCreateFlowVersionUsersAsync([FromBody] IEnumerable<FlowVersionUserDto> flowVersionUserDtos)
    {
        return ResultHelper(await _flowVersionUserService.BulkInsertFlowVersionUsersAsync(flowVersionUserDtos));
    }

    // Update an existing flow version user
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<FlowVersionUserDto>>> UpdateFlowVersionUserAsync([FromBody] FlowVersionUserDto flowVersionUserDto)
    {
        return ResultHelper(await _flowVersionUserService.UpdateFlowVersionUserAsync(flowVersionUserDto));
    }

    // Delete a flow version user by ID
    [HttpDelete("{flowVersionUserId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlowVersionUserAsync(Guid flowVersionUserId)
    {
        return ResultHelper(await _flowVersionUserService.DeleteFlowVersionUserAsync(flowVersionUserId));
    }

    // Delete multiple flow version users
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlowVersionUsersAsync([FromBody] IEnumerable<Guid> flowVersionUserIds)
    {
        return ResultHelper(await _flowVersionUserService.DeleteFlowVersionUsersAsync(flowVersionUserIds));
    }
}