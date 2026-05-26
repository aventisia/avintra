namespace WorkspaceAPIs.Controllers;

[Route("agent")]
[ApiController]
[Authorize]
public class AgentTableController : BaseApiController
{
    private readonly IAgentTableService _agentTableService;

    public AgentTableController(IAgentTableService agentTableService)
    {
        _agentTableService = agentTableService;
    }

    // Retrieves a list of personal published flow versions for a specific flow identified by its flowId.
    [HttpGet("published")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AgentTableDto>>>> GetPersonalPublishFlowVersionsAsync(Guid? flowId)
    {
        return ResultHelper(await _agentTableService.GetPublishFlowVersionsAsync(flowId, true));
    }

    // Retrieves a list of shared published flow versions for a specific flow identified by its flowId.
    [HttpGet("published/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AgentTableDto>>>> GetSharedPublishFlowVersionsAsync(Guid? flowId)
    {
        return ResultHelper(await _agentTableService.GetPublishFlowVersionsAsync(flowId, false));
    }

    // Retrieves a list of personal archived flow versions for a specific flow identified by its flowId.
    [HttpGet("archived")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AgentTableDto>>>> GetPersonalArchiveFlowVersionsAsync(Guid? flowId)
    {
        return ResultHelper(await _agentTableService.GetArchiveFlowVersionsAsync(flowId, true));
    }

    // Retrieves a list of shared archived flow versions for a specific flow identified by its flowId.
    [HttpGet("archived/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AgentTableDto>>>> GetSharedArchiveFlowVersionsAsync(Guid? flowId)
    {
        return ResultHelper(await _agentTableService.GetArchiveFlowVersionsAsync(flowId, false));
    }

    // Retrieves a list of archived flow versions for a specific flow identified by its flowId.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AgentTableDto>>> UpdateFlowVersion(AgentTableDto agentTableDto)
    {
        return ResultHelper(await _agentTableService.UpdateFlowVersionAsync(agentTableDto));
    }

    // Retrieves a list of draft (executing) flow versions for a specific flow identified by its flowId.
    [HttpGet("execute-flow-version")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AgentTableDto>>>> GetExecuteFlowVersionsAsync(Guid? flowId)
    {
        return ResultHelper(await _agentTableService.GetExecuteFlowVersionsAsync(flowId));
    }

    // Assigns multiple machines to a specific agent using the agentId and a list of machineIds.
    [HttpPost("{agentId}/assign-machines")]
    public async Task<ActionResult<ServiceResponse<bool>>> AssignMachinesToAgentAsync(Guid agentId, [FromBody] IEnumerable<Guid> machineIds)
    {
        return ResultHelper(await _agentTableService.AssignMachinesToAgentAsync(agentId, machineIds));
    }

    // Removes multiple machines from a specific agent using the agentId and a list of machineIds.
    [HttpPost("{agentId}/remove-machines")]
    public async Task<ActionResult<ServiceResponse<bool>>> RemoveMachinesFromAgentAsync(Guid agentId, [FromBody] IEnumerable<Guid> machineIds)
    {
        return ResultHelper(await _agentTableService.RemoveMachinesFromAgentAsync(agentId, machineIds));
    }

    // Retrieves a list of machines associated with a specific agent identified by agentId.
    [HttpGet("{agentId}/machines")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignMachineDto>>>> GetMachinesByAgentAsync(Guid agentId)
    {
        return ResultHelper(await _agentTableService.GetMachinesByAgentAsync(agentId));
    }

    // Searches for published flow versions that match the specified search keyword.
    [HttpGet("search/{seachKey}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignMachineDto>>>> SearchPublishFlowVersions(string seachKey, [FromQuery] bool isPersonal)
    {
        return ResultHelper(await _agentTableService.SearchPublishFlowVersionsAsync(seachKey, isPersonal));
    }

    // Disables multiple flow versions based on the provided list of IDs.
    [HttpPost("disable-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DisableMultipleFlowVersions([FromBody] IEnumerable<Guid> flowVersionIds)
    {
        return ResultHelper(await _agentTableService.DisableMultipleFlowVersionsAsync(flowVersionIds));
    }

    // Retrieves the total count of published flow versions for a specific flow or all flows.
    [HttpGet("total-published")]
    public async Task<ActionResult<ServiceResponse<int>>> GetTotalPublishedFlowVersionsAsync()
    {
        return ResultHelper(await _agentTableService.GetTotalPublishedFlowVersionsAsync());
    }
}