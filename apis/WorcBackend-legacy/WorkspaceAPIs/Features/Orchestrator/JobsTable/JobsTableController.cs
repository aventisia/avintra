namespace WorkspaceAPIs.Controllers;

[Authorize(Roles = "OM")]
[ApiController]
[Route("job")]
[Authorize(Roles = "OM")]
public class JobsTableController : BaseApiController
{
    private readonly IJobsTableService _jobsTableService;

    public JobsTableController(IJobsTableService jobsTableService)
    {
        _jobsTableService = jobsTableService;
    }

    // Retrieves a list of jobs based on optional start and end date filters.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<JobsTableRowDto>>>> GetJobs(
        [FromQuery] DateTimeOffset? startDate,
        [FromQuery] DateTimeOffset? endDate)
    {
        return ResultHelper(await _jobsTableService.GetJobsAsync(startDate, endDate));
    }

    // Get job by its ID.
    [HttpGet("{jobId}")]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> GetJob(Guid jobId)
    {
        return ResultHelper(await _jobsTableService.GetJobAsync(jobId));
    }

    // Inserts a new job.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> InsertJob([FromBody] JobInsertDto jobInsertDto)
    {
        return ResultHelper(await _jobsTableService.InsertJobAsync(jobInsertDto));
    }

    // Updates an existing job.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> UpdateJob([FromBody] JobUpdateDto jobUpdateDto)
    {
        return ResultHelper(await _jobsTableService.UpdateJobAsync(jobUpdateDto));
    }

    // Deletes a job by its ID.
    [HttpDelete("{jobId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteJob(Guid jobId)
    {
        return ResultHelper(await _jobsTableService.DeleteJobAsync(jobId));
    }

    // Delete multiple jobs by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteJobs([FromBody] IEnumerable<Guid> jobIds)
    {
        return ResultHelper(await _jobsTableService.DeleteJobsAsync(jobIds));
    }

    // Starts a job by transitioning it from Created to Running.
    [HttpPost("start")]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> StartJob([FromBody] JobStartDto jobStartDto)
    {
        return ResultHelper(await _jobsTableService.StartJobAsync(jobStartDto));
    }

    // Closes a job in a terminal status, records the end time and logs, and tracks consumed credits.
    [HttpPost("close")]
    public async Task<ActionResult<ServiceResponse<JobRecordDto>>> CloseJob([FromBody] JobCloseDto jobCloseDto)
    {
        return ResultHelper(await _jobsTableService.CloseJobAsync(jobCloseDto));
    }

    // Aborts a running job by transitioning it to Aborted and sending an Abort command to the executing machine.
    [HttpPost("abort")]
    public async Task<ActionResult<ServiceResponse<bool>>> AbortMachineExecution([FromBody] JobAbortRequestDto jobAbortRequestDto)
    {
        return ResultHelper(await _jobsTableService.AbortJobExecutionAsync(jobAbortRequestDto));
    }

    // Exports jobs data into a CSV file
    [HttpPost("export")]
    public async Task<ActionResult<FileStreamResult>> ExportJobs(ExportJobsReqDto exportJobsReqDto)
    {
        var exportedData = await _jobsTableService.ExportJobsAsync(exportJobsReqDto);
        if (exportedData.StatusCode == 200 && exportedData.Data != null)
        {
            return exportedData.Data;
        }
        return ResultHelper(exportedData);
    }



    // TODO: Need to check this
    // [HttpGet("logs/list")]
    // public async Task<ActionResult<ServiceResponse<IEnumerable<JobsTableRowDto>>>> GetJobLogs(
    //     [FromQuery] DateTimeOffset? startDate,
    //     [FromQuery] DateTimeOffset? endDate)
    // {
    //     return ResultHelper(await _jobsTableService.GetJobLogsAsync(startDate, endDate));
    // }

    // [HttpPost("{jobId}/retry")]
    // public async Task<ActionResult<ServiceResponse<bool>>> RetryJobAsync(Guid jobId)
    // {
    //     return ResultHelper(await _jobsTableService.RetryJobAsync(jobId));
    // }

    // [HttpPost("{jobId}/cancel")]
    // public async Task<ActionResult<ServiceResponse<bool>>> CancelJob(Guid jobId)
    // {
    //     return ResultHelper(await _jobsTableService.CancelJobAsync(jobId));
    // }

    // // Exports jobs data into a CSV file
    // [HttpPost("export")]
    // public async Task<ActionResult> ExportJobs(ExportJobRequestDto exportJobRequestDto)
    // {
    //     var exportedData = await _jobsTableService.ExportJobsAsync(exportJobRequestDto);
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
    //     return ResultHelper(await _jobsTableService.InsertJobAsync(jobUpsertDto));
    // }
}