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

    // Returns the fixed credits override configured for an agent (flow version).
    // Used by the LLM pipeline to skip token-based credit deduction when the agent
    // has a fixed credits override set by the Super Admin (Tenants section).
    [HttpGet("agent/{flowVersionId}/fixed-credits")]
    public async Task<ActionResult<ServiceResponse<int?>>> GetAgentFixedCredits(Guid flowVersionId)
    {
        return ResultHelper(await _jobsTableService.GetAgentFixedCreditsAsync(flowVersionId));
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
        var response = await _jobsTableService.StartJobAsync(new JobStartDto { Id = jobId });

        // Surface an already-started job as 409 Conflict so the runner can treat it as
        // idempotent rather than a client error.
        if (response.StatusCode == 400 &&
            !string.IsNullOrWhiteSpace(response.Message) &&
            response.Message.Contains("Only jobs in created status can be started.", StringComparison.OrdinalIgnoreCase))
        {
            response.StatusCode = 409;
            response.Message = $"Job '{jobId}' is already started or no longer in Created status.";
        }

        return ResultHelper(response);
    }

    // Closes a job in a terminal status. This is an executor-only endpoint reachable
    // with a machine JWT (dual auth: API key or JWT).
    [HttpPost("job/{jobId}/close")]
    [AllowAnonymous, ApiKeyAuthorize("machineAuth", allowJwtAuth: true)]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> CloseJob(Guid jobId, [FromBody] JobCloseDto jobCloseDto)
    {
        jobCloseDto.Id = jobId;
        var response = await _jobsTableService.CloseJobAsync(jobCloseDto);

        // Surface a double-close as 409 Conflict so the runner can treat it as idempotent.
        if (response.StatusCode == 400 &&
            !string.IsNullOrWhiteSpace(response.Message) &&
            response.Message.Contains("Cannot close a job that is already completed or closed.", StringComparison.OrdinalIgnoreCase))
        {
            response.StatusCode = 409;
            response.Message = $"Job '{jobId}' is already in a terminal status.";
        }

        return ResultHelper(response);
    }
}
