namespace WorkspaceAPIs.Controllers;

[Route("execution-log")]
[ApiController]
[Authorize]
public class ExecutionLogController : BaseApiController
{
    private readonly IExecutionLogService _executionLogService;

    public ExecutionLogController(IExecutionLogService executionLogService)
    {
        _executionLogService = executionLogService;
    }

    // Gets list of execution logs of single flow using flow Id.
    [HttpGet("list/{flowId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExecutionLogDto>>>> GetExecutionLogs(Guid flowId)
    {
        return ResultHelper(await _executionLogService.GetExecutionLogsAsync(flowId));
    }

    // Creates a new execution log
    [HttpPost("create")]
    public async Task<ActionResult<ServiceResponse<ExecutionLogDto>>> InsertExecutionLog([FromBody] ExecutionLogDto executionLogDto)
    {
        return ResultHelper(await _executionLogService.InsertExecutionLogAsync(executionLogDto));
    }

    // Update the execution log 
    [HttpPut("update")]
    public async Task<ActionResult<ServiceResponse<ExecutionLogDto>>> UpdateExecutionLog([FromBody] ExecutionLogDto executionLogDto)
    {
        return ResultHelper(await _executionLogService.UpdateExecutionLogAsync(executionLogDto));
    }

    // Deletes execution log permanently
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteExecutionLog(Guid id)
    {
        return ResultHelper(await _executionLogService.DeleteExecutionLogAsync(id));
    }
}