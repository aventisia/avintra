namespace WorkspaceAPIs.Controllers;

[Route("api/flow-user")]
[ApiController]
[Authorize]
public class FlowUserController : BaseApiController
{
    private readonly IFlowUserService _flowUserService;

    public FlowUserController(IFlowUserService flowUserService)
    {
        _flowUserService = flowUserService;
    }

    // Gets list of flow users of a specific flow using flow Id.
    [HttpGet("list/{flowId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowUserDto>>>> GetFlowUsers(Guid flowId)
    {
        return ResultHelper(await _flowUserService.GetFlowUsersByFlowIdAsync(flowId));
    }

    // Retrieves a specific flow user by their unique identifier.
    [HttpGet("{flowUserId}")]
    public async Task<ActionResult<ServiceResponse<FlowUserDto>>> GetFlowUserById(Guid flowUserId)
    {
        return ResultHelper(await _flowUserService.GetFlowUserByIdAsync(flowUserId));
    }

    // Adds a new user to a flow.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FlowUserDto>>> InsertFlowUser([FromBody] FlowUserDto flowUserDto)
    {
        return ResultHelper(await _flowUserService.InsertFlowUserAsync(flowUserDto));
    }

    // Updates an existing flow user.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<FlowUserDto>>> UpdateFlowUser([FromBody] FlowUserDto flowUserDto)
    {
        return ResultHelper(await _flowUserService.UpdateFlowUserAsync(flowUserDto));
    }

    // Deletes a flow user from the flow permanently.
    [HttpDelete("{flowUserId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlowUser(Guid flowUserId)
    {
        return ResultHelper(await _flowUserService.DeleteFlowUserAsync(flowUserId));
    }

    // Removes access of a flow user from the flow permanently.
    [HttpDelete("access/{flowId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> RemoveAccessByFlow(Guid flowId)
    {
        return ResultHelper(await _flowUserService.RemoveUserAccessFromFlowAsync(flowId));
    }


    // Deletes multiple flow users by a list of their unique identifiers.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleFlowUsers([FromBody] IEnumerable<Guid> flowUserIds)
    {
        return ResultHelper(await _flowUserService.DeleteMultipleFlowUsersAsync(flowUserIds));
    }
}