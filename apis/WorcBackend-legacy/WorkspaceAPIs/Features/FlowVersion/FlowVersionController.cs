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

    // Updates the execution settings for the specified flow version.
    [HttpPut("{flowVersionId}/settings")]
    public async Task<ActionResult<ServiceResponse<bool>>> UpdateFlowVersionSettings(Guid flowVersionId, [FromBody] ExecutionSettings executionSettings)
    {
        return ResultHelper(await _flowVersionService.UpdateFlowVersionSettingsAsync(flowVersionId, executionSettings));
    }

    // Deletes flow version permanently
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlowVersion(Guid id)
    {
        return ResultHelper(await _flowVersionService.DeleteFlowVersionAsync(id));
    }

    // Searches flow versions by flow name/version, with filtering by publish state and flow type.
    [HttpGet("search")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchFlowVersionResDto>>>> SearchFlowVersion(
        [FromQuery] string query,
        [FromQuery] FlowTypesEnum type = FlowTypesEnum.Agent,
        [FromQuery] bool includePublishedOnly = true)
    {
        var request = new SearchFlowVersionReqDto
        {
            SearchKey = query,
            Type = type,
            IncludePublishedOnly = includePublishedOnly
        };

        return ResultHelper(await _flowVersionService.SearchFlowVersionsAsync(request));
    }
}