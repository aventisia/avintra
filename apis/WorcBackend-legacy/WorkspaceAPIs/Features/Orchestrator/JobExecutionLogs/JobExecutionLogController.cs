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

    // Retrieves detailed information for the specified job execution.
    [HttpGet("detail/{jobId}")]
    public async Task<ActionResult<ServiceResponse<JobExecutionLogDetailDto>>> GetLogDetail(Guid jobId)
    {
        return ResultHelper(
            await _jobExecutionLogService.GetLogDetailAsync(jobId)
        );
    }
}