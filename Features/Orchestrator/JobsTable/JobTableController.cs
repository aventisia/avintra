namespace WorkspaceAPIs.Controllers;

[ApiController]
[Route("job")]
public class JobController : BaseApiController
{
    private readonly IJobTableService _jobTableService;

    public JobController(IJobTableService jobTableService)
    {
        _jobTableService = jobTableService;
    }

    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<JobTableDto>>>> GetJobs()
    {
        return ResultHelper(await _jobTableService.GetJobsAsync());
    }

    [HttpGet("logs/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<JobExecutionLogDto>>>> GetJobLogs()
    {
        return ResultHelper(await _jobTableService.GetJobLogsAsync());
    }

    [HttpGet("{jobId}")]
    public async Task<ActionResult<ServiceResponse<JobTableDto>>> GetJob(Guid jobId)
    {
        return ResultHelper(await _jobTableService.GetJobByIdAsync(jobId));
    }

    [HttpGet("detail/{jobId}")]
    public async Task<ActionResult<ServiceResponse<JobTableDto>>> GetJobDetailById(Guid jobId)
    {
        return ResultHelper(await _jobTableService.GetJobDetailByIdAsync(jobId));
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<JobTableDto>>> CreateJobAsync([FromBody] JobTableDto jobTableDto)
    {
        return ResultHelper(await _jobTableService.InsertJobAsync(jobTableDto));
    }

    [HttpPut]
    public async Task<ActionResult<ServiceResponse<JobTableDto>>> UpdateJobAsync([FromBody] JobExecutionDto jobTableDto)
    {
        return ResultHelper(await _jobTableService.UpdateJobAsync(jobTableDto));
    }

    [HttpDelete("{jobId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteJobAsync(Guid jobId)
    {
        return ResultHelper(await _jobTableService.DeleteJobAsync(jobId));
    }

    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteJobsAsync(IEnumerable<Guid> jobIds)
    {
        return ResultHelper(await _jobTableService.DeleteJobsAsync(jobIds));
    }

    [HttpPost("{jobId}/retry")]
    public async Task<ActionResult<ServiceResponse<bool>>> RetryJobAsync(Guid jobId)
    {
        return ResultHelper(await _jobTableService.RetryJobAsync(jobId));
    }

    [HttpPost("{jobId}/cancel")]
    public async Task<ActionResult<ServiceResponse<bool>>> CancelJob(Guid jobId)
    {
        return ResultHelper(await _jobTableService.CancelJobAsync(jobId));
    }

    // Abort the execution of a job on the machine
    [HttpPost("abort")]
    public async Task<ActionResult<ServiceResponse<bool>>> AbortMachineExecution(JobExecutionDto jobExecutionDto)
    {
        return ResultHelper(await _jobTableService.AbortJobExecutionAsync(jobExecutionDto));
    }
}
