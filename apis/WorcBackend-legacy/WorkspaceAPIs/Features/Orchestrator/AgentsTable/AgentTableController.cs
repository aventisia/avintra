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

    // Retrieves a list of published flow versions for a specific flow identified by its flowId.
    [Authorize(Roles = "OM")]
    [HttpGet("published")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AgentTableDto>>>> GetPublishFlowVersionsAsync(Guid? flowId)
    {
        return ResultHelper(await _agentTableService.GetPublishFlowVersionsAsync(flowId));
    }

    // Retrieves a list of archived flow versions for a specific flow identified by its flowId.
    [HttpGet("archived")]
    [Authorize(Roles = "TA")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AgentTableDto>>>> GetArchiveFlowVersionsAsync(Guid? flowId)
    {
        return ResultHelper(await _agentTableService.GetArchiveFlowVersionsAsync(flowId));
    }

    // Retrieves a list of archived flow versions for a specific flow identified by its flowId.
    [HttpPut]
    [Authorize(Roles = "OM")]
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
    [Authorize(Roles = "OM")]
    [HttpPost("{agentId}/assign-machines")]
    public async Task<ActionResult<ServiceResponse<bool>>> AssignMachinesToAgentAsync(Guid agentId, [FromBody] IEnumerable<Guid> machineIds)
    {
        return ResultHelper(await _agentTableService.AssignMachinesToAgentAsync(agentId, machineIds));
    }

    // Removes multiple machines from a specific agent using the agentId and a list of machineIds.
    [Authorize(Roles = "OM")]
    [HttpPost("{agentId}/remove-machines")]
    public async Task<ActionResult<ServiceResponse<bool>>> RemoveMachinesFromAgentAsync(Guid agentId, [FromBody] IEnumerable<Guid> machineIds)
    {
        return ResultHelper(await _agentTableService.RemoveMachinesFromAgentAsync(agentId, machineIds));
    }

    // Retrieves a list of machines associated with a specific agent identified by agentId.
    [HttpGet("{agentId}/machines")]
    [Authorize(Roles = "OM")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignMachineDto>>>> GetMachinesByAgentAsync(Guid agentId)
    {
        return ResultHelper(await _agentTableService.GetMachinesByAgentAsync(agentId));
    }

    // Searches for published flow versions that match the specified search keyword.
    [HttpGet("search/{seachKey}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignMachineDto>>>> SearchPublishFlowVersions(string seachKey)
    {
        return ResultHelper(await _agentTableService.SearchPublishFlowVersionsAsync(seachKey));
    }

    // Disables multiple flow versions based on the provided list of IDs.
    [Authorize(Roles = "OM")]
    [HttpPost("disable-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DisableMultipleFlowVersions([FromBody] IEnumerable<Guid> flowVersionIds)
    {
        return ResultHelper(await _agentTableService.DisableMultipleFlowVersionsAsync(flowVersionIds));
    }

    // Retrieves the total count of published flow versions for a specific flow or all flows.
    [Authorize(Roles = "OM")]
    [HttpGet("total-published")]
    public async Task<ActionResult<ServiceResponse<int>>> GetTotalPublishedFlowVersionsAsync()
    {
        return ResultHelper(await _agentTableService.GetTotalPublishedFlowVersionsAsync());
    }

    // Retrieves all archived flow versions.
    [HttpGet("archived/list")]
    [Authorize(Roles = "OM")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AgentTableDto>>>> GetArchivedFlowVersions()
    {
        return ResultHelper(await _agentTableService.GetArchivedFlowVersionsAsync(true));
    }

    // Retrieves all archived shared flow versions.
    [Authorize(Roles = "OM")]
    [HttpGet("archived/list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AgentTableDto>>>> GetArchivedSharedFlowVersions()
    {
        return ResultHelper(await _agentTableService.GetArchivedFlowVersionsAsync(false));
    }
}