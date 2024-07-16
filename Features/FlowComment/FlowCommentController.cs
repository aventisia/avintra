namespace WorkspaceAPIs.Controllers;

[Route("flow-comment")]
[ApiController]
[Authorize]
public class FlowCommentController : BaseApiController
{
    private readonly IFlowCommentService _flowCommentCrudService;

    public FlowCommentController(IFlowCommentService flowCommentCrudService)
    {
        _flowCommentCrudService = flowCommentCrudService;
    }

    // Gets list of flow comments of single flow using flow Id.
    [HttpGet("list/{flowId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowCommentDto>>>> GetFlowComments(Guid flowId)
    {
        return ResultHelper(await _flowCommentCrudService.GetFlowCommentsAsync(flowId));
    }

    // Creates a new flow commment
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FlowCommentDto>>> InsertFlowComment([FromBody] FlowCommentDto flowCommentDto)
    {
        return ResultHelper(await _flowCommentCrudService.InsertFlowCommentAsync(flowCommentDto));
    }

    // Update the flow comment with IsEdited flag
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<FlowCommentDto>>> UpdateFlowComment([FromBody] FlowCommentDto flowCommentDto)
    {
        return ResultHelper(await _flowCommentCrudService.UpdateFlowCommentAsync(flowCommentDto));
    }

    // Deletes flow comment permanently
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlowComment(Guid id)
    {
        return ResultHelper(await _flowCommentCrudService.DeleteFlowCommentAsync(id));
    }
}