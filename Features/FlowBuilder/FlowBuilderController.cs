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
    [HttpGet("load/{id}")]
    public async Task<ActionResult<ServiceResponse<LoadFlowDto>>> GetFlowToLoad(Guid id)
    {
        return ResultHelper(await _flowBuilderService.GetFlowToLoadAsync(id));
    }
}