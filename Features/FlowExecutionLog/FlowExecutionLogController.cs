namespace WorkspaceAPIs.Controllers;

[Route("api/flow-execution-log")]
[ApiController]
[Authorize]
public class FlowExecutionLogController : BaseApiController
{
    private readonly IFlowExecutionLogService _flowExecutionLogService;

    public FlowExecutionLogController(IFlowExecutionLogService flowExecutionLogService)
    {
        _flowExecutionLogService = flowExecutionLogService;
    }

    // Gets list of flow execution logs of single flow using flow Id.
    [HttpGet("list/{flowId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowExecutionLogDto>>>> GetFlowExecutionLogs(Guid flowId)
    {
        return ResultHelper(await _flowExecutionLogService.GetFlowExecutionLogsAsync(flowId));
    }

    // Gets list of flow execution logs 
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowExecutionLogDto>>>> GetFlowExecutionLogList()
    {
        return ResultHelper(await _flowExecutionLogService.GetFlowExecutionLogListAsync());
    }

    // Creates a new flow execution log
    [HttpPost("create")]
    public async Task<ActionResult<ServiceResponse<FlowExecutionLogDto>>> InsertFlowExecutionLog([FromBody] FlowExecutionLogDto flowExecutionLogDto)
    {
        return ResultHelper(await _flowExecutionLogService.InsertFlowExecutionLogAsync(flowExecutionLogDto));
    }

    // Update a flow execution log 
    [HttpPut("update")]
    public async Task<ActionResult<ServiceResponse<FlowExecutionLogDto>>> UpdateFlowExecutionLog([FromBody] FlowExecutionLogDto flowExecutionLogDto)
    {
        return ResultHelper(await _flowExecutionLogService.UpdateFlowExecutionLogAsync(flowExecutionLogDto));
    }

    // Deletes a flow execution log permanently
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFLowExecutionLog(Guid id)
    {
        return ResultHelper(await _flowExecutionLogService.DeleteFlowExecutionLogAsync(id));
    }

    // Delete multiple flow execution log by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFLowExecutionLogList([FromBody] List<Guid> ids)
    {
        return ResultHelper(await _flowExecutionLogService.DeleteFLowExecutionLogListAsync(ids));
    }
}