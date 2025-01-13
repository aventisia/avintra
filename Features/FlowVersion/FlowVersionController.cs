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
}