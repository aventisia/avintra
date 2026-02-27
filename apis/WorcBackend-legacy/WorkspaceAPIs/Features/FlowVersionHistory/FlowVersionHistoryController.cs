namespace WorkspaceAPIs.Controllers;

[Route("flow-version-history")]
[ApiController]
[Authorize]
public class FlowVersionHistoryController : BaseApiController
{
    private readonly IFlowVersionHistoryService _flowVersionHistoryService;

    public FlowVersionHistoryController(IFlowVersionHistoryService flowVersionHistoryService)
    {
        _flowVersionHistoryService = flowVersionHistoryService;
    }

    // Retrieves all history records for a specific flow version.
    [HttpGet("{flowVersionId}/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowVersionHistoryDto>>>> GetFlowVersionHistory(Guid flowVersionId)
    {
        return ResultHelper(await _flowVersionHistoryService.GetAllAsync(flowVersionId));
    }

    // Retrieves a specific flow version history detail by its ID.
    [HttpGet("{flowVersionHistoryId}")]
    public async Task<ActionResult<ServiceResponse<FlowVersionHistoryDetailDto>>> GetFlowVersionHistoryById(Guid flowVersionHistoryId)
    {
        return ResultHelper(await _flowVersionHistoryService.GetByIdAsync(flowVersionHistoryId));
    }

    // Creates a new flow version history record.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FlowVersionHistoryDto>>> InsertFlowVersionHistory([FromBody] FlowVersionHistoryDto flowVersionHistoryDto)
    {
        return ResultHelper(await _flowVersionHistoryService.InsertAsync(flowVersionHistoryDto));
    }

    // Updates an existing flow version history record.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<FlowVersionHistoryDto>>> UpdateFlowVersionHistory([FromBody] FlowVersionHistoryDto flowVersionHistoryDto)
    {
        return ResultHelper(await _flowVersionHistoryService.UpdateAsync(flowVersionHistoryDto));
    }

    // Deletes a flow version history record by its ID.
    [HttpDelete("{flowVersionHistoryId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlowVersionHistory(Guid flowVersionHistoryId)
    {
        return ResultHelper(await _flowVersionHistoryService.DeleteByIdAsync(flowVersionHistoryId));
    }

    // Deletes multiple flow version history records using a list of flowVersionHistoryIds.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleFlowVersionHistory([FromBody] IEnumerable<Guid> flowVersionHistoryIds)
    {
        return ResultHelper(await _flowVersionHistoryService.DeleteMultipleAsync(flowVersionHistoryIds));
    }

    // Creates a new flow version history record by cloning a flow.
    [HttpPost("clone-flow")]
    public async Task<ActionResult<ServiceResponse<FlowVersionHistoryDto>>> CloneFlow([FromBody] FlowVersionHistoryDto flowVersionHistoryDto)
    {
        return ResultHelper(await _flowVersionHistoryService.CloneFlowAsync(flowVersionHistoryDto));
    }

    // Creates a new flow version history record by cloning a specific flow version.
    [HttpPost("clone-flow-version")]
    public async Task<ActionResult<ServiceResponse<FlowVersionHistoryDto>>> CloneFlowVersion([FromBody] FlowVersionHistoryDto flowVersionHistoryDto)
    {
        return ResultHelper(await _flowVersionHistoryService.CloneFlowVersionAsync(flowVersionHistoryDto));
    }
}