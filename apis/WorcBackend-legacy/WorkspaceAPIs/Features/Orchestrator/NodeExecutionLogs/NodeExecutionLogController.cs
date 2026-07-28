namespace WorkspaceAPIs.Controllers;

/// <summary>
/// Provides endpoints for managing per-node execution logs associated with a job.
/// </summary>
[ApiController]
[Route("job/{jobId}/node-execution-logs")]
public class NodeExecutionLogController : BaseApiController
{
    private readonly INodeExecutionLogService _nodeExecutionLogService;

    public NodeExecutionLogController(INodeExecutionLogService nodeExecutionLogService)
    {
        _nodeExecutionLogService = nodeExecutionLogService;
    }

    // Inserts a batch of node execution logs for the specified job.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<bool>>> InsertNodeExecutionLogs(
        Guid jobId,
        [FromBody] List<NodeExecutionLogDto> logs)
    {
        return ResultHelper(await _nodeExecutionLogService.InsertNodeExecutionLogsAsync(jobId, logs));
    }

    // Retrieves all node execution logs for the specified job.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<List<NodeExecutionLogDto>>>> GetNodeExecutionLogs(Guid jobId)
    {
        return ResultHelper(await _nodeExecutionLogService.GetNodeExecutionLogsAsync(jobId));
    }
}
