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

    // Retrieves all flows created by the user.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowsTableDto>>>> GetPersonalFlows(
        [FromQuery] bool includeArchived = false)
    {
        return ResultHelper(await _flowsTableService.GetFlowsAsync(true, includeArchived));
    }

    // Retrieves all shared flows.
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowsTableDto>>>> GetSharedFlows(
        [FromQuery] bool includeArchived = false)
    {
        return ResultHelper(await _flowsTableService.GetFlowsAsync(false, includeArchived));
    }

    // Checks the availability of a flow name.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsFlowNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _flowsTableService.IsFlowNameAvailableAsync(checkAvailabilityDto));
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

    /// <summary>
    /// Moves an existing flow into a folder, or to the top level when no folder is given.
    /// </summary>
    [HttpPut("folder")]
    public async Task<ActionResult<ServiceResponse<bool>>> UpdateFlowFolder([FromBody] UpdateFlowFolderDto updateFlowFolderDto)
    {
        return ResultHelper(await _flowsTableService.UpdateFlowFolderAsync(updateFlowFolderDto));
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