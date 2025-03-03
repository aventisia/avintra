namespace WorkspaceAPIs.Controllers;

[Route("flow-version")]
[ApiController]
[Authorize]
public class FlowVersionController : BaseApiController
{
    private readonly IFlowVersionService _flowVersionService;

    public FlowVersionController(IFlowVersionService flowVersionService)
    {
        _flowVersionService = flowVersionService;
    }

    // Gets list of flow versions of single flow using flow Id.
    [HttpGet("list/{flowId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowVersionDto>>>> GetFlowVersions(Guid flowId)
    {
        return ResultHelper(await _flowVersionService.GetFlowVersionsAsync(flowId));
    }

    // Creates a new flow version
    [HttpPost("create")]
    public async Task<ActionResult<ServiceResponse<FlowVersionDto>>> InsertFlowVersion([FromBody] FlowVersionDto flowVersionDto)
    {
        return ResultHelper(await _flowVersionService.InsertFlowVersionAsync(flowVersionDto));
    }

    // Update the flow version with IsEdited flag
    [HttpPut("update")]
    public async Task<ActionResult<ServiceResponse<FlowVersionDto>>> UpdateFlowVersion([FromBody] FlowVersionDto flowVersionDto)
    {
        return ResultHelper(await _flowVersionService.UpdateFlowVersionAsync(flowVersionDto));
    }

    // Deletes flow version permanently
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlowVersion(Guid id)
    {
        return ResultHelper(await _flowVersionService.DeleteFlowVersionAsync(id));
    }

       // Assign multiple agent to machine by their IDs.
    [HttpPost("{agentId}/assign-machines")]
    public async Task<ActionResult<ServiceResponse<bool>>> AssignMachinesToAgentAsync(Guid agentId,[FromBody] IEnumerable<Guid> machineIds)
    {
        return ResultHelper(await _flowVersionService.AssignMachinesToAgentAsync(agentId, machineIds));
    }

    // Delete multiple agent from machine by their IDs.
    [HttpPost("{agentId}/remove-machines")]
    public async Task<ActionResult<ServiceResponse<bool>>> RemoveMachinesFromAgentAsync(Guid agentId ,[FromBody] IEnumerable<Guid> machineIds)
    {
        return ResultHelper(await _flowVersionService.RemoveMachinesFromAgentAsync(agentId, machineIds));
    }

    // Retrieve agent list by machine ID.
    [HttpGet("{agentId}/machines")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignMachineDto>>>> GetMachinesByAgentAsync(Guid agentId)
    {
        return ResultHelper(await _flowVersionService.GetMachinesByAgentAsync(agentId));
    }
}