namespace WorkspaceAPIs.Controllers;

[Route("flow-version-tools")]
[ApiController]
[Authorize]
public class FlowVersionToolsController : BaseApiController
{
    private readonly IFlowVersionToolService _flowVersionToolService;

    public FlowVersionToolsController(IFlowVersionToolService flowVersionToolService)
    {
        _flowVersionToolService = flowVersionToolService;
    }

    // Gets all tools linked to a flow version.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowVersionToolDto>>>> GetFlowVersionTools([FromQuery] Guid flowVersionId)
    {
        return ResultHelper(await _flowVersionToolService.GetFlowVersionToolsAsync(flowVersionId));
    }

    // Links a tool to a flow version.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FlowVersionToolDto>>> LinkToolToFlowVersion([FromBody] FlowVersionToolDto flowVersionToolDto)
    {
        return ResultHelper(await _flowVersionToolService.LinkToolToFlowVersionAsync(flowVersionToolDto));
    }

    // Updates a tool linked to a flow version.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<FlowVersionToolDto>>> UpdateFlowVersionTool([FromBody] FlowVersionToolDto flowVersionToolDto)
    {
        return ResultHelper(await _flowVersionToolService.UpdateFlowVersionToolAsync(flowVersionToolDto));
    }

    // Removes a tool from a flow version.
    [HttpDelete("{flowVersionToolId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlowVersionTool(Guid flowVersionToolId)
    {
        return ResultHelper(await _flowVersionToolService.DeleteFlowVersionToolAsync(flowVersionToolId));
    }
}