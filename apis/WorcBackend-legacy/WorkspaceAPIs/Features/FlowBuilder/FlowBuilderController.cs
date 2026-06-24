namespace WorkspaceAPIs.Controllers;

[Route("flow")]
[ApiController]
[Authorize]
public class FlowBuilderController : BaseApiController
{
    private readonly IFlowBuilderService _flowBuilderService;

    public FlowBuilderController(IFlowBuilderService flowBuilderService)
    {
        _flowBuilderService = flowBuilderService;
    }

    // Retrieves the flow record to load when the user opens it in the studio.
    [HttpGet("load/{flowId}")]
    public async Task<ActionResult<ServiceResponse<LoadFlowDto>>> GetFlowToLoad(Guid flowId, Guid? versionId)
    {
        return ResultHelper(await _flowBuilderService.GetFlowToLoadAsync(flowId, versionId));
    }

    // Updates the flow's nodes, edges, etc. and saves the flow version in the database.
    [HttpPut("save")]
    public async Task<ActionResult<ServiceResponse<bool>>> SaveFlow([FromBody] FlowSilentUpdateDto flowSilentUpdateDto)
    {
        return ResultHelper(await _flowBuilderService.SaveFlowVersionAsync(flowSilentUpdateDto));
    }

    // Updates the IsPublished,flow's nodes, edges, etc. silently in the background whenever the user makes any changes
    [HttpPut("publish")]
    public async Task<ActionResult<ServiceResponse<bool>>> PublishFlowVersion([FromBody] PublishFlowVersionDto publishFlowVersionDto)
    {
        return ResultHelper(await _flowBuilderService.PublishFlowVersionAsync(publishFlowVersionDto));
    }

    // Fetch the parent flow details of given parent flow version id
    [HttpPost("fetch-parent-flow/{parentFlowVersionId}")]
    public async Task<ActionResult<ServiceResponse<FetchParentFlowDto>>> FetchParentFlow(Guid parentFlowVersionId)
    {
        return ResultHelper(await _flowBuilderService.FetchParentFlowAsync(parentFlowVersionId));
    }

    // Fetch the reactFlowObject of given list of flow version ids
    [HttpPost("fetch-sub-flows")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FetchSubFlowDto>>>> FetchSubFlows([FromBody] IEnumerable<Guid> subFlowIds)
    {
        return ResultHelper(await _flowBuilderService.FetchSubFlowsAsync(subFlowIds));
    }
}