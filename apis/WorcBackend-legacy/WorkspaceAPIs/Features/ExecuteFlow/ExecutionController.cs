namespace WorkspaceAPIs.Controllers;

[ApiController]
[Route("execution")]
[Authorize]
public class ExecutionController : BaseApiController
{
    private readonly IExecutionGraphService _executionGraphService;
    private readonly INodeExecutionLogService _nodeExecutionLogService;
    private readonly IJobsTableService _jobsTableService;

    public ExecutionController(
        IExecutionGraphService executionGraphService,
        INodeExecutionLogService nodeExecutionLogService,
        IJobsTableService jobsTableService)
    {
        _executionGraphService = executionGraphService;
        _nodeExecutionLogService = nodeExecutionLogService;
        _jobsTableService = jobsTableService;
    }

    [HttpGet("graph/{jobId}")]
    public async Task<ActionResult<ServiceResponse<ExecutionGraphDto>>> GetExecutionGraph(Guid jobId)
    {
        return ResultHelper(await _executionGraphService.GetExecutionGraphAsync(jobId));
    }

    [HttpPost("logs/{jobId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> InsertNodeExecutionLogs(
        Guid jobId,
        [FromBody] List<NodeExecutionLogDto> logs)
    {
        return ResultHelper(await _nodeExecutionLogService.InsertNodeExecutionLogsAsync(jobId, logs));
    }

    // Starts a job (Created -> Running). This is an executor-only endpoint that is
    // reachable with a machine JWT (dual auth: API key or JWT) so the runner app
    // can mark a job as running without requiring the OM role on the user account.
    [HttpPost("job/{jobId}/start")]
    [AllowAnonymous, ApiKeyAuthorize("machineAuth", allowJwtAuth: true)]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> StartJob(Guid jobId)
    {
        return ResultHelper(await _jobsTableService.StartJobAsync(new JobStartDto { Id = jobId }));
    }

    // Closes a job in a terminal status. This is an executor-only endpoint reachable
    // with a machine JWT (dual auth: API key or JWT).
    [HttpPost("job/{jobId}/close")]
    [AllowAnonymous, ApiKeyAuthorize("machineAuth", allowJwtAuth: true)]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> CloseJob(Guid jobId, [FromBody] JobCloseDto jobCloseDto)
    {
        jobCloseDto.Id = jobId;
        return ResultHelper(await _jobsTableService.CloseJobAsync(jobCloseDto));
    }
}
