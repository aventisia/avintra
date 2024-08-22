namespace WorkspaceAPIs.Controllers;

[Route("flow")]
[ApiController]
[Authorize]
public class FlowsTableController : BaseApiController
{
    private readonly IFlowsTableService _flowsTableService;

    public FlowsTableController(IFlowsTableService flowsTableService)
    {
        _flowsTableService = flowsTableService;
    }

    // Retrieves all flows associated with a project.
    [HttpGet("list/{projectId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowsTableDto>>>> GetFlows(Guid projectId)
    {
        return ResultHelper(await _flowsTableService.GetFlowsAsync(projectId));
    }

    // Checks the availability of a flow name.
    [HttpPost("is-available/{projectId}")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsFlowNameAvailable(Guid projectId, [FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _flowsTableService.IsFlowNameAvailableAsync(projectId, checkAvailabilityDto));
    }

    // Inserts a new flow.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FlowsTableDto>>> InsertFlow([FromBody] FlowsTableDto flowsTableDto)
    {
        return ResultHelper(await _flowsTableService.InsertFlowAsync(flowsTableDto));
    }

    // Updates an existing flow.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<FlowsTableDto>>> UpdateFlow([FromBody] FlowsTableDto flowsTableDto)
    {
        return ResultHelper(await _flowsTableService.UpdateFlowAsync(flowsTableDto));
    }

    // Deletes a flow by its ID.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlow(Guid id)
    {
        return ResultHelper(await _flowsTableService.DeleteFlowAsync(id));
    }

    // Delete multiple flows by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlows([FromBody] List<Guid> ids)
    {
        // If only one ID is passed, call the single delete method.
        if (ids.Count == 1)
            return ResultHelper(await _flowsTableService.DeleteFlowAsync(ids[0]));
        
        // Otherwise, call the multiple delete method.
        return ResultHelper(await _flowsTableService.DeleteFlowsAsync(ids));
    }
}