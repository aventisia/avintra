namespace WorkspaceAPIs.Controllers;

[Route("api/Flow-log")]
[ApiController]
[Authorize]

public class FlowLogController : BaseApiController
{
  private readonly IFlowLogService _flowLogService;

  public FlowLogController(IFlowLogService flowLogService)
  {
    _flowLogService = flowLogService;
  }

  [HttpGet("list/{flowId}")]
  public async Task<ActionResult<ServiceResponse<IEnumerable<FlowLogDto>>>> GetFlowLog(Guid flowId)
  {
    return ResultHelper(await _flowLogService.GetFlowLogAsync(flowId));
  }

  // Inserts a new flow log.
  [HttpPost]
  public async Task<ActionResult<ServiceResponse<FlowLogDto>>> InsertFlowLog([FromBody] FlowLogDto flowLogDto)
  {
    return ResultHelper(await _flowLogService.InsertFlowLogAsync(flowLogDto));
  }

  // Update Flow log
  [HttpPut]
  public async Task<ActionResult<ServiceResponse<FlowLogDto>>> UpdateFlowLog([FromBody] FlowLogDto flowLogDto)
  {
    return ResultHelper(await _flowLogService.UpdateFlowLogAsync(flowLogDto));
  }

  // Deletes flow log permanently
  [HttpDelete("{id}")]
  public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlowLog(Guid id)
  {
    return ResultHelper(await _flowLogService.DeleteFlowLogAsync(id));
  }



}