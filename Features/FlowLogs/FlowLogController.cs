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
}