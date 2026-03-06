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
    public async Task<ActionResult<ServiceResponse<IEnumerable<JobTableDto>>>> GetJobs(
        [FromQuery] DateTimeOffset? startDate,
        [FromQuery] DateTimeOffset? endDate,
        [FromQuery] bool includeLogs = false)
    {
        return ResultHelper(await _jobTableService.GetJobsAsync(startDate, endDate, includeLogs));
    }

    [HttpGet("logs/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<JobTableDto>>>> GetJobLogs(
        [FromQuery] DateTimeOffset? startDate,
        [FromQuery] DateTimeOffset? endDate)
    {
        return ResultHelper(await _jobTableService.GetJobLogsAsync(startDate, endDate));
    }

    [HttpGet("{jobId}")]
    public async Task<ActionResult<ServiceResponse<JobTableDto>>> GetJob(Guid jobId)
    {
        return ResultHelper(await _jobTableService.GetJobByIdAsync(jobId));
    }

    [HttpGet("detail/{jobId}")]
    public async Task<ActionResult<ServiceResponse<JobDetailDto>>> GetJobDetailById(Guid jobId)
    {
        return ResultHelper(await _jobTableService.GetJobDetailByIdAsync(jobId));
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<JobTableDto>>> CreateJobAsync([FromBody] JobTableDto jobTableDto)
    {
        return ResultHelper(await _jobTableService.InsertJobAsync(jobTableDto));
    }

    [HttpPut]
    public async Task<ActionResult<ServiceResponse<JobTableDto>>> UpdateJobAsync([FromBody] JobTableDto jobTableDto)
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

    // Exports jobs data into a CSV file
    [HttpPost("export")]
    public async Task<ActionResult> ExportJobs(ExportJobRequestDto exportJobRequestDto)
    {
        var exportedData = await _jobTableService.ExportJobsAsync(exportJobRequestDto);
        if (exportedData.StatusCode == 200 && exportedData.Data != null)
        {
            return exportedData.Data;
        }
        return ResultHelper(exportedData);
    }

    //Trigger the creation of a new job (custom authorization)
    [AllowAnonymous, CustomAuthorize] // Allows automated triggers or special tokens
    [HttpPost("trigger")]
    public async Task<ActionResult<ServiceResponse<JobTableDto>>> TriggerJobCreation([FromBody] JobTableDto jobTableDto)
    {
        return ResultHelper(await _jobTableService.InsertJobAsync(jobTableDto));
    }
}