namespace WorkspaceAPIs.Controllers;

[Route("FlowLog")]
[ApiController]
[Authorize]

public class FlowLogController : BaseApiController
{
      private readonly IFlowLogService _flowLogService;

      public FlowLogController(IFlowLogService flowLogService)
      {
        _flowLogService = flowLogService;
      }

    // Inserts a new flow.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<FlowLogDto>>> CreateFlowLog([FromBody] FlowLogDto flowLogDto)
    {
        return ResultHelper(await _flowLogService.CreateFlowLogAsync(flowLogDto));
    }
}