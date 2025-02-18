namespace WorkspaceAPIs.Controllers;

[Route("execution-log")]
[ApiController]
[Authorize]
public class ActionExecutionLogController : BaseApiController
{
    private readonly IActionExecutionLogService _executionLogService;

    public ActionExecutionLogController(IActionExecutionLogService executionLogService)
    {
        _executionLogService = executionLogService;
    }

    // Gets list of action execution logs of single flow using flow Id.
    [HttpGet("list/{flowExecutionId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ActionExecutionLogDto>>>> GetActionExecutionLogs(Guid flowId)
    {
        return ResultHelper(await _executionLogService.GetActionExecutionLogsAsync(flowId));
    }

    // Creates a new action execution log
    [HttpPost("create")]
    public async Task<ActionResult<ServiceResponse<ActionExecutionLogDto>>> InsertActionExecutionLog([FromBody] ActionExecutionLogDto executionLogDto)
    {
        return ResultHelper(await _executionLogService.InsertActionExecutionLogAsync(executionLogDto));
    }

    // Update the action execution log 
    [HttpPut("update")]
    public async Task<ActionResult<ServiceResponse<ActionExecutionLogDto>>> UpdateActionExecutionLog([FromBody] ActionExecutionLogDto executionLogDto)
    {
        return ResultHelper(await _executionLogService.UpdateActionExecutionLogAsync(executionLogDto));
    }

    // Deletes action execution log permanently
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteActionExecutionLog(Guid id)
    {
        return ResultHelper(await _executionLogService.DeleteActionExecutionLogAsync(id));
    }
}