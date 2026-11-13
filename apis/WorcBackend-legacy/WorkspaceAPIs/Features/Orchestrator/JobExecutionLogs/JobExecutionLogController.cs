namespace WorkspaceAPIs.Controllers;

[ApiController]
[Route("job-execution-logs")]
public class JobExecutionLogController : BaseApiController
{
    private readonly IJobExecutionLogService _jobExecutionLogService;

    public JobExecutionLogController(IJobExecutionLogService jobExecutionLogService)
    {
        _jobExecutionLogService = jobExecutionLogService;
    }

    // Retrieves execution logs associated with the specified flow version.
    [HttpGet("list/{flowVersionId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<JobExecutionLogDto>>>> GetLogs(Guid flowVersionId)
    {
        return ResultHelper(
            await _jobExecutionLogService.GetLogsByFlowVersionAsync(flowVersionId)
        );
    }

    // Retrieves run counts, outcomes, and average duration for an agent across all its versions.
    [HttpGet("activity/{flowId}")]
    public async Task<ActionResult<ServiceResponse<AgentRunActivityDto>>> GetRunActivity(
        Guid flowId,
        [FromQuery] int days = 14,
        [FromQuery] int utcOffsetMinutes = 0)
    {
        return ResultHelper(
            await _jobExecutionLogService.GetRunActivityAsync(flowId, days, utcOffsetMinutes)
        );
    }

    // Retrieves detailed information for the specified job execution.
    [HttpGet("detail/{jobId}")]
    public async Task<ActionResult<ServiceResponse<JobExecutionLogDetailDto>>> GetLogDetail(Guid jobId)
    {
        return ResultHelper(
            await _jobExecutionLogService.GetLogDetailAsync(jobId)
        );
    }
}