namespace WorkspaceAPIs.Controllers;

[Route("flow-block")]
[ApiController]
[Authorize]
public class FlowBlockController : BaseApiController
{
    private readonly IFlowBlockService _flowBlockService;

    public FlowBlockController(IFlowBlockService flowBlockService)
    {
        _flowBlockService = flowBlockService;
    }

    // Retrieves a list of flow blocks associated with a specific flow.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowBlockDto>>>> GetFlowBlocks(Guid? flowId)
    {
        return ResultHelper(await _flowBlockService.GetFlowBlocksByFlowIdAsync(flowId));
    }

    // Retrieves a specific flow block by its unique identifier.
    [HttpGet("{flowBlockId}")]
    public async Task<ActionResult<ServiceResponse<FlowBlockDto>>> GetFlowBlockById(Guid flowBlockId)
    {
        return ResultHelper(await _flowBlockService.GetFlowBlockByIdAsync(flowBlockId));
    }

    // Adds a new flow block.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FlowBlockDto>>> InsertFlowBlock([FromBody] FlowBlockDto flowBlockDto)
    {
        return ResultHelper(await _flowBlockService.InsertFlowBlockAsync(flowBlockDto));
    }

    // Updates an existing flow block.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<FlowBlockDto>>> UpdateFlowBlock([FromBody] FlowBlockDto flowBlockDto)
    {
        return ResultHelper(await _flowBlockService.UpdateFlowBlockAsync(flowBlockDto));
    }

    // Deletes a flow block by its unique identifier.
    [HttpDelete("{flowBlockId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlowBlock(Guid flowBlockId)
    {
        return ResultHelper(await _flowBlockService.DeleteFlowBlockAsync(flowBlockId));
    }

    // Deletes multiple flow blocks based on their unique identifiers.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleFlowBlocks([FromBody] IEnumerable<Guid> flowBlockIds)
    {
        return ResultHelper(await _flowBlockService.DeleteMultipleFlowBlocksAsync(flowBlockIds));
    }
}
