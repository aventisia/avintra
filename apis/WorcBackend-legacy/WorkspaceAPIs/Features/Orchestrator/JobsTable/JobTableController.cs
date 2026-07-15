namespace WorkspaceAPIs.Controllers;

[Authorize(Roles = "OM")]
[ApiController]
[Route("job")]
[Authorize(Roles = "OM")]
public class JobTableController : BaseApiController
{
    private readonly IJobTableService _jobTableService;

    public JobTableController(IJobTableService jobTableService)
    {
        _jobTableService = jobTableService;
    }

    // Retrieves a list of jobs based on optional start and end date filters.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<JobTableRowDto>>>> GetJobs(
        [FromQuery] DateTimeOffset? startDate,
        [FromQuery] DateTimeOffset? endDate)
    {
        return ResultHelper(await _jobTableService.GetJobsAsync(startDate, endDate));
    }

    // Get job by its ID.
    [HttpGet("{jobId}")]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> GetJob(Guid jobId)
    {
        return ResultHelper(await _jobTableService.GetJobAsync(jobId));
    }

    // Inserts a new job.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> InsertJob([FromBody] JobInsertDto jobInsertDto)
    {
        return ResultHelper(await _jobTableService.InsertJobAsync(jobInsertDto));
    }

    // Updates an existing job.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> UpdateJob([FromBody] JobUpdateDto jobUpdateDto)
    {
        return ResultHelper(await _jobTableService.UpdateJobAsync(jobUpdateDto));
    }

    // Deletes a job by its ID.
    [HttpDelete("{jobId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteJob(Guid jobId)
    {
        return ResultHelper(await _jobTableService.DeleteJobAsync(jobId));
    }

    // Delete multiple jobs by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteJobs([FromBody] IEnumerable<Guid> jobIds)
    {
        return ResultHelper(await _jobTableService.DeleteJobsAsync(jobIds));
    }

    // Exports jobs data into a CSV file
    [HttpPost("export")]
    public async Task<ActionResult<FileStreamResult>> ExportJobs(ExportJobsReqDto exportJobsReqDto)
    {
        var exportedData = await _jobTableService.ExportJobsAsync(exportJobsReqDto);
        if (exportedData.StatusCode == 200 && exportedData.Data != null)
        {
            return exportedData.Data;
        }
        return ResultHelper(exportedData);
    }



    // TODO: Need to check this
    // [HttpGet("logs/list")]
    // public async Task<ActionResult<ServiceResponse<IEnumerable<JobTableRowDto>>>> GetJobLogs(
    //     [FromQuery] DateTimeOffset? startDate,
    //     [FromQuery] DateTimeOffset? endDate)
    // {
    //     return ResultHelper(await _jobTableService.GetJobLogsAsync(startDate, endDate));
    // }

    // [HttpPost("{jobId}/retry")]
    // public async Task<ActionResult<ServiceResponse<bool>>> RetryJobAsync(Guid jobId)
    // {
    //     return ResultHelper(await _jobTableService.RetryJobAsync(jobId));
    // }

    // [HttpPost("{jobId}/cancel")]
    // public async Task<ActionResult<ServiceResponse<bool>>> CancelJob(Guid jobId)
    // {
    //     return ResultHelper(await _jobTableService.CancelJobAsync(jobId));
    // }

    // // Abort the execution of a job on the machine
    // [HttpPost("abort")]
    // public async Task<ActionResult<ServiceResponse<bool>>> AbortMachineExecution(JobAbortRequestDto jobAbortRequestDto)
    // {
    //     return ResultHelper(await _jobTableService.AbortJobExecutionAsync(jobAbortRequestDto));
    // }

    // // Exports jobs data into a CSV file
    // [HttpPost("export")]
    // public async Task<ActionResult> ExportJobs(ExportJobRequestDto exportJobRequestDto)
    // {
    //     var exportedData = await _jobTableService.ExportJobsAsync(exportJobRequestDto);
    //     if (exportedData.StatusCode == 200 && exportedData.Data != null)
    //     {
    //         return exportedData.Data;
    //     }
    //     return ResultHelper(exportedData);
    // }

    // //Trigger the creation of a new job (custom authorization)
    // [AllowAnonymous, CustomAuthorize] // Allows automated triggers or special tokens
    // [HttpPost("trigger")]
    // public async Task<ActionResult<ServiceResponse<JobTableDto>>> TriggerJobCreation([FromBody] JobUpsertDto jobUpsertDto)
    // {
    //     return ResultHelper(await _jobTableService.InsertJobAsync(jobUpsertDto));
    // }
}