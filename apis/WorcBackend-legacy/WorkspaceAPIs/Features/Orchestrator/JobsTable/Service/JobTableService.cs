namespace WorkspaceAPIs.Services;

public class JobTableService : IJobTableService
{
    private readonly ILogger<JobTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IJobsExecutorService _jobsExecutorService;
    private readonly IWebhookCallbackService _webhookCallbackService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly Guid _userId;
    private readonly string _userMachine;

    public JobTableService(
        ILogger<JobTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IJobsExecutorService jobsExecutorService,
        IWebhookCallbackService webhookCallbackService,
        EnvironmentConfig environmentConfig)
    {
        // Set the user ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Fetch the custom header: X-User-Machine (only set if running inside Tauri Desktop App)
        _userMachine = httpContextAccessor.HttpContext?.Request?.Headers["X-User-Machine"].FirstOrDefault() ?? string.Empty;

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _jobsExecutorService = jobsExecutorService;
        _webhookCallbackService = webhookCallbackService;
        _environmentConfig = environmentConfig;
    }

    // Retrieves a list of all jobs between optional start and end date filters.
    public async Task<ServiceResponse<IEnumerable<JobsTableRowDto>>> GetJobsAsync(DateTimeOffset? startDate, DateTimeOffset? endDate)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<IEnumerable<JobsTableRowDto>>.Create("Failed to fetch jobs", 500);

        try
        {
            // Resolve date range
            var dateRange = JobsTableHelpers.ResolveDateRange(startDate, endDate);

            // Return if start date greater than the end date
            if (dateRange.StartDate > dateRange.EndDate)
                return serviceResponse.Update("Invalid date range", 400);

            // Retrieve the list of records
            var jobs = await _unitOfWork.JobRepo
                        .GetByConditionAsync(w =>
                            w.CreatedOn >= dateRange.StartDate.Date &&
                            w.CreatedOn < dateRange.EndDate.Date.AddDays(1)
                        )
                        // When we use ProjectToType then we don't have to explicitly include the related entities (FlowVersion and Flow) because the mapping configuration will handle it. However, if you want to include them for other reasons (like eager loading), you can uncomment the following lines.
                        //.Include(i => i.FlowVersion)
                        //.ThenInclude(i2 => i2.Flow)
                        .OrderByDescending(o => o.CreatedOn)
                        .ProjectToType<JobsTableRowDto>()
                        .ToListAsync();

            // Task successful
            return serviceResponse.Update(null, 200, jobs);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving jobs list between {StartDate} and {EndDate}.", startDate, endDate);
            return serviceResponse;
        }
    }

    // Get job by its ID.
    public async Task<ServiceResponse<JobRecordDto>> GetJobAsync(Guid jobId)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<JobRecordDto>.Create("Failed to fetch job", 500);

        try
        {
            // Retrieve the record
            var jobRecord = await _unitOfWork.JobRepo
                        .GetByConditionAsync(w => w.Id == jobId)
                        .Include(i => i.FlowVersion)
                        .ThenInclude(i2 => i2.Flow)
                        .FirstOrDefaultAsync(); // Since primary key (jobId) included in where clause, FirstOrDefaultAsync is appropriate here

            // If record not found, log and return
            if (jobRecord == null)
                return serviceResponse.Update("Job not found.", 404);

            // Map the retrieved Job entity to JobRecordDto
            var jobRecordDto = jobRecord.Adapt<JobRecordDto>();

            // TODO: For now, JobInputData, JobOutputData mapping will be handled in the service layer as they are stored as JSON strings in the database
            // Once the JobInputData, JobOutputData are stored as JsonDocument objects in the database, we can remove this mapping from the service layer and handle it in the mapping profile.
            // We can use ProjectToType<JobRecordDto>() once JobInputData and JobOutputData are stored in JsonDocument
            jobRecordDto.JobInputData = JobsTableHelpers.ParseJsonOrNull(jobRecord.InputArgumentsJson);
            jobRecordDto.JobOutputData = JobsTableHelpers.ParseJsonOrNull(jobRecord.OutputDataJson);

            // TODO: Once we start saving the Execution log in its own table then we can fetch
            // the last node execution log and set it in the JobRecordDto. For now, we will set it to null.
            jobRecordDto.LastNodeLog = null;

            // Task successful
            return serviceResponse.Update(null, 200, jobRecordDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving job record for Job ID {jobId}.", jobId);
            return serviceResponse;
        }
    }

    // Inserts a new job.
    public async Task<ServiceResponse<JobRecordDto>> InsertJobAsync(JobInsertDto jobInsertDto)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<JobRecordDto>.Create("Failed to create job", 500);

        try
        {
            // CANNOT CREATE THE JOB: Execution is disabled for the on-prem tenant
            if (_environmentConfig.OnPremExecutionDisabled)
                return serviceResponse.Update("Execution is currently disabled. Please contact Aventisia Support.", 503);

            // Retrieve the FlowVersion record
            var flowVersion = await _unitOfWork.FlowVersionRepo
                                .GetByConditionAsync(w => w.Id == jobInsertDto.FlowVersionId)
                                .Include(i => i.FlowVersionHistories)
                                .Select(s => new
                                {
                                    FlowName = s.Flow != null ? s.Flow.Name : "FLOW_NAME_NOT_FOUND",
                                    FlowType = s.Flow != null ? s.Flow.Type : FlowTypesEnum.Agent,
                                    FlowVersionNumber = s.VersionNumber,
                                    IsFlowVersionPublished = s.IsPublished,
                                    FlowVersionHistoryId = s.FlowVersionHistories
                                                                .OrderByDescending(o => o.CreatedOn)
                                                                .Select(s2 => s2.Id)
                                                                .FirstOrDefault()
                                })
                                .AsNoTracking()
                                .FirstOrDefaultAsync();

            // If FlowVersion record not found, log and return
            if (flowVersion == null)
                return serviceResponse.Update("Agent not found.", 404);

            // TODO: Need to check this
            // Machine? machine = null;
            // // If the OSId is provided, attempt to find a matching machine.
            // if (!string.IsNullOrEmpty(jobInsertDto.OSId))
            // {
            //     machine = await _unitOfWork.MachineRepo
            //         .GetByConditionAsync(w =>
            //             w.OSId.ToLower() == jobInsertDto.OSId.ToLower())
            //         .FirstOrDefaultAsync();

            //     // Log the outcome of the machine search.
            //     if (machine != null)
            //     {
            //         // If a machine is found, assign its ID to the job DTO.
            //         jobInsertDto.MachineId = machine.Id;
            //         _logger.LogInformation("Machine found with ID: {MachineId}", machine.Id);
            //     }
            //     else
            //     {
            //         _logger.LogWarning("No machine found with OSId: {OSId}", jobInsertDto.OSId);
            //     }
            // }

            // Trim the string properties in the DTO to remove any leading/trailing spaces (if applicable).
            jobInsertDto = TrimDtoStringPropsUtil.TrimDtoStringProps(jobInsertDto);

            // Default mapping
            var newJob = jobInsertDto.Adapt<Job>();
            newJob.RetryCount = 0; // Default retry count to 0, will be updated below if JobId is provided

            // Manual mapping: Set RetryCount (if JobId is provided)
            if (jobInsertDto.JobId.HasValue)
            {
                // Find the existing job with the same JobId and FlowVersionId to determine the retry count
                var existingJobs = await _unitOfWork.JobRepo
                                .GetByConditionAsync(w => w.Id == jobInsertDto.JobId && w.FlowVersionId == jobInsertDto.FlowVersionId)
                                .CountAsync();

                // If no existing job found, log and return
                if (existingJobs == 0)
                    return serviceResponse.Update("No existing job found.", 404);

                newJob.RetryCount = existingJobs;
            }

            // Manual mapping: Set the FlowVersionHistoryId
            newJob.FlowVersionHistoryId = flowVersion.FlowVersionHistoryId;

            // Manual mapping: Set CreatedByName and CreatedById
            if (jobInsertDto.TriggerType == TriggerTypesEnum.Manual)
            {
                // Retrieve user record
                var userRecord = await _unitOfWork.WorkspaceUserRepo
                                    .GetByConditionAsync(w => w.Id == _userId)
                                    .FirstOrDefaultAsync();

                // If user not found, log and return
                if (userRecord == null)
                    return serviceResponse.Update("User not found.", 404);

                // TODO: Property name to be changed CreatedByName = [Full name - email]
                newJob.ExecutedBy = $"{userRecord.FirstName} {userRecord.LastName} - {userRecord.UserName}";

                // TODO: Property name to be changed CreatedById = [User Id]
                newJob.RefId = userRecord.Id;
            }

            // Manual mapping: Set the ExecutionLocation for unpublished flow
            if (!flowVersion.IsFlowVersionPublished)
            {
                // TODO: Property name to be changed ExecutionLocation 
                newJob.ExecutedOn = !string.IsNullOrEmpty(_userMachine) ? _userMachine : "Agent Builder (web)";
            }

            // TODO: Mannual mapping till the time JobInputData is stored as JsonDocument in the database
            newJob.InputArgumentsJson = jobInsertDto.JobInputData != null ? jobInsertDto.JobInputData.RootElement.GetRawText() : null;

            // Insert job
            await _unitOfWork.JobRepo.InsertAsync(newJob);

            // Insert-Job failed, log and return
            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("Failed to save changes.", 500);

            // Map newJob to JobRecordDto for the response
            var jobRecordDto = newJob.Adapt<JobRecordDto>();
            jobRecordDto.FlowName = flowVersion.FlowName;
            jobRecordDto.FlowType = flowVersion.FlowType;
            jobRecordDto.FlowVersionNumber = $"v{flowVersion.FlowVersionNumber}";
            jobRecordDto.IsFlowVersionPublished = flowVersion.IsFlowVersionPublished;

            // TODO: Need to check this. 
            // If the flow version is published, trigger the job execution.
            if (flowVersion.IsFlowVersionPublished)
            {
                // Execute the job asynchronously.
                await _jobsExecutorService.ExecuteJobCommandAsync(newJob);
            }

            // Return Success response
            return serviceResponse.Update("Job created", 201, jobRecordDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while inserting new job.");
            return serviceResponse;
        }
    }

    // Updates an existing job.
    public async Task<ServiceResponse<JobRecordDto>> UpdateJobAsync(JobUpdateDto jobUpdateDto)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<JobRecordDto>.Create("Failed to update job", 500);

        try
        {
            // Retrieve the record
            var job = await _unitOfWork.JobRepo
                        .GetByConditionAsync(w => w.Id == jobUpdateDto.Id)
                        .Include(i => i.FlowVersion)
                            .ThenInclude(i2 => i2.Flow)
                        .Include(i => i.Machine)
                        .FirstOrDefaultAsync();

            // If record not found, log and return
            if (job == null)
                return serviceResponse.Update("Job not found.", 404);

            // Trim the string properties in the DTO
            jobUpdateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(jobUpdateDto);

            // Default mapping
            jobUpdateDto.Adapt(job);

            // TODO: Need to check this.
            // // Checks if the job status is the same as the stored status (no change).
            // bool isStatusUnchanged = job.Status == jobUpdateDto.Status;

            // // Map the updated values from DTO to the job entity
            // jobUpdateDto.Adapt(job);
            // job.IsPublished = job.FlowVersion.IsPublished;

            // // Populate "ExecutedBy" only if it has not already been set.
            // //
            // // Attribution rules:
            // // 1. ManualTrigger (non-published) → current authenticated user name or Agent Builder fallback.
            // // 2. API, Email, Event, Message, Queue, Time, Webhook → trigger name (prefixed for traceability).
            // // 3. All other trigger types → constructed machine identity (OS username + OS ID).
            // //
            // // NOTE: This mapping should be reviewed whenever new TriggerTypesEnum values are introduced.
            // if (string.IsNullOrWhiteSpace(job.ExecutedBy))
            // {
            //     // Attempt to resolve workspace user (applicable for UI-based executions)
            //     var user = await _unitOfWork.WorkspaceUserRepo
            //         .GetByConditionAsync(w => w.Id == _userId)
            //         .SingleOrDefaultAsync();

            //     // Manual execution (Agent Builder / UI)
            //     if (job.TriggerType == TriggerTypesEnum.Manual && !job.IsPublished)
            //     {
            //         job.ExecutedBy = user != null
            //             ? $"{user.FirstName} {user.LastName}"
            //             : "Agent Builder";

            //         job.ExecutedOn = job.Machine != null
            //             ? job.Machine.Name ?? "Agent Builder (web)"
            //             : "Agent Builder (desktop)";
            //     }
            //     // Trigger-based execution
            //     else if (
            //         job.TriggerType == TriggerTypesEnum.Api ||
            //         job.TriggerType == TriggerTypesEnum.Email ||
            //         job.TriggerType == TriggerTypesEnum.Event ||
            //         job.TriggerType == TriggerTypesEnum.Message ||
            //         job.TriggerType == TriggerTypesEnum.Queue ||
            //         job.TriggerType == TriggerTypesEnum.Time ||
            //         job.TriggerType == TriggerTypesEnum.Webhook)
            //     {
            //         var trigger = await _unitOfWork.TriggerRepo
            //             .GetByConditionAsync(w => w.Id == job.RefId)
            //             .FirstOrDefaultAsync();

            //         job.ExecutedBy = trigger != null
            //             ? $"trigger_{trigger.Name}"
            //             : "trigger_Unknown";

            //         job.ExecutedOn = job.Machine != null
            //             ? $"machine_{job.Machine.Name}"
            //             : "Web Server";
            //     }
            //     // Machine-based execution (default fallback)
            //     else
            //     {
            //         var safeUser = job.Machine?.Hostname?.Trim().ToLower() ?? "unknown";
            //         var osId = job.Machine?.OSId;
            //         var shortOsId = !string.IsNullOrEmpty(osId) && osId.Length >= 4
            //             ? osId.Substring(0, 4).ToLower()
            //             : "xxxx";

            //         job.ExecutedOn = $"machine_{safeUser}_{shortOsId}";
            //         job.ExecutedBy = user != null
            //             ? $"{user.FirstName} {user.LastName}"
            //             : "Unknown User";
            //     }
            // }

            // // Update job execution timestamps only for published flow versions.
            // if (job.IsPublished)
            // {
            //     // If the job status is "Running", set the StartTime to the current UTC time.
            //     if (job.Status == JobStatusEnum.Running)
            //         job.StartTime = DateTimeOffset.UtcNow;

            //     // If the job status is "Canceled", "Abort", "Completed", or "Failed", the EndTime to the current UTC time.
            //     if (job.Status == JobStatusEnum.Canceled ||
            //         job.Status == JobStatusEnum.Abort ||
            //         job.Status == JobStatusEnum.Completed ||
            //         job.Status == JobStatusEnum.Failed)
            //         job.EndTime = DateTimeOffset.UtcNow;
            // }

            // Update the record
            _unitOfWork.JobRepo.Update(job);

            // Update-Job failed, log and return
            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("Failed to save changes.", 500);

            // Return success response
            return serviceResponse.Update("Job updated", 200, job.Adapt<JobRecordDto>());

            // TODO: Need to check this
            // // If the job status has changed (i.e., it differs from the previously stored status), proceed with the action.
            // if (!isStatusUnchanged && job.IsPublished)
            // {
            //     // Create a new ExecutionCommandDto to determine which action to trigger based on job status.
            //     var executionCommand = new ExecutionCommandDto()
            //     {
            //         JobId = job.Id,
            //         MachineId = job.MachineId ?? Guid.Empty,
            //         AgentId = job.FlowVersionId,
            //         TenantId = job.TenantId
            //     };

            //     // Switch statement to set the correct execution command based on the job's current status.
            //     switch (job.Status)
            //     {
            //         case JobStatusEnum.Completed:
            //             executionCommand.Command = ExecutionCommandTypesEnum.Cleanup;
            //             break;

            //         case JobStatusEnum.Failed:
            //         case JobStatusEnum.Canceled:
            //             executionCommand.Command = ExecutionCommandTypesEnum.Cancel;
            //             break;

            //         case JobStatusEnum.Abort:
            //             executionCommand.Command = ExecutionCommandTypesEnum.Abort;
            //             break;

            //         case JobStatusEnum.Paused:
            //             executionCommand.Command = ExecutionCommandTypesEnum.Pause;
            //             break;

            //         case JobStatusEnum.Resumed:
            //             executionCommand.Command = ExecutionCommandTypesEnum.Resume;
            //             break;

            //         case JobStatusEnum.Retrying:
            //         case JobStatusEnum.Running:
            //             executionCommand.Command = ExecutionCommandTypesEnum.Execute;
            //             break;

            //         default:
            //             executionCommand.Command = ExecutionCommandTypesEnum.Cleanup;
            //             break;
            //     }

            //     // Trigger the appropriate execution command for the job.
            //     await _jobsExecutorService.TriggerExecutionAsync(executionCommand);
            // }

            // // Fire webhook callback if this is a webhook-triggered job that has reached a terminal state.
            // if (job.TriggerType == TriggerTypesEnum.Webhook &&
            //     (job.Status == JobStatusEnum.Completed ||
            //      job.Status == JobStatusEnum.Failed ||
            //      job.Status == JobStatusEnum.Canceled))
            // {
            //     _ = Task.Run(async () =>
            //     {
            //         try { await _webhookCallbackService.SendCallbackAsync(job); }
            //         catch (Exception cbEx) { _logger.LogError(cbEx, "Webhook callback error for job {JobId}.", job.Id); }
            //     });
            // }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating the job with ID {JobId}.", jobUpdateDto.Id);
            return serviceResponse;
        }
    }

    // Deletes a job by its ID.
    public async Task<ServiceResponse<bool>> DeleteJobAsync(Guid jobId)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete job", 500);

        try
        {
            // Retrieve the record
            var job = await _unitOfWork.JobRepo
                        .GetByConditionAsync(w => w.Id == jobId)
                        .FirstOrDefaultAsync();

            // If record not found, log and return
            if (job == null)
                return serviceResponse.Update("Job not found.", 404);

            // CANNOT DELETE THE JOB: Job is not in 'Created' status
            if (job.Status != JobStatusEnum.Created)
                return serviceResponse.Update("Only jobs in created status can be deleted.", 400);

            // Delete the record
            _unitOfWork.JobRepo.Delete(job);

            // Delete-Job failed, log and return
            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("Failed to save changes.", 500);

            // Return success response
            return serviceResponse.Update("Job deleted", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting the job with ID {JobId}.", jobId);
            return serviceResponse;
        }
    }

    // Delete multiple jobs by their IDs.
    public async Task<ServiceResponse<bool>> DeleteJobsAsync(IEnumerable<Guid> jobIds)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<bool>.Create("Failed to delete jobs", 500);

        try
        {
            // Retrieve the records
            var jobs = await _unitOfWork.JobRepo
                        .GetByConditionAsync(w => jobIds.Contains(w.Id))
                        .ToListAsync();

            // If records not found, log and return
            if (jobs.Count == 0)
                return serviceResponse.Update("Jobs not found.", 404);

            // CANNOT DELETE THE JOB: Job is not in 'Created' status
            if (jobs.Any(j => j.Status != JobStatusEnum.Created))
                return serviceResponse.Update("Only jobs in created status can be deleted.", 400);

            // Delete the records
            _unitOfWork.JobRepo.Delete(jobs);

            // Delete-Jobs failed, log and return
            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("Failed to save changes.", 500);

            // Return success response
            return serviceResponse.Update("Jobs deleted", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting the jobs with IDs {JobIds}.", string.Join(", ", jobIds));
            return serviceResponse;
        }
    }

    // Exports jobs data into a CSV file 
    public async Task<ServiceResponse<FileStreamResult>> ExportJobsAsync(ExportJobsReqDto exportJobsReqDto)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<FileStreamResult>.Create("Failed to export jobs data.", 500);

        try
        {
            // Resolve date range
            var dateRange = JobsTableHelpers.ResolveDateRange(exportJobsReqDto.StartDate, exportJobsReqDto.EndDate);

            // Return if start date greater than the end date
            if (dateRange.StartDate > dateRange.EndDate)
                return serviceResponse.Update("Start date cannot be greater than end date.", 400);

            // Initialize the base query with date filter
            var jobsExportQuery = _unitOfWork.JobRepo
                                    .GetByConditionAsync(w =>
                                        w.StartTime >= dateRange.StartDate.Date &&
                                        w.StartTime < dateRange.EndDate.Date.AddDays(1)
                                    )
                                    .OrderByDescending(o => o.StartTime)
                                    .AsQueryable();

            // Filter Statuses
            if (exportJobsReqDto.Statuses?.Any() == true)
            {
                jobsExportQuery = jobsExportQuery.Where(w => exportJobsReqDto.Statuses.Contains(w.Status));
            }

            // Filter FlowVersionIds
            if (exportJobsReqDto.FlowVersionIds?.Any() == true)
            {
                jobsExportQuery = jobsExportQuery.Where(w => exportJobsReqDto.FlowVersionIds.Contains(w.FlowVersionId));
            }

            // Filter TriggerTypes
            if (exportJobsReqDto.TriggerTypes?.Any() == true)
            {
                jobsExportQuery = jobsExportQuery.Where(w => exportJobsReqDto.TriggerTypes.Contains(w.TriggerType));
            }

            // TODO: Rename ExecutedOn to ExecutionLocation later Filter ExecutionLocations
            if (exportJobsReqDto.ExecutionLocations?.Any() == true)
            {
                jobsExportQuery = jobsExportQuery.Where(w => exportJobsReqDto.ExecutionLocations.Contains(w.ExecutedOn ?? string.Empty));
            }

            // Filter IncludePublishedFlows
            // NOTE: If both IncludePublishedFlows and IncludeUnpublishedFlows are false or true then do not apply any filter
            if (exportJobsReqDto.IncludePublishedFlows && !exportJobsReqDto.IncludeUnpublishedFlows)
            {
                jobsExportQuery = jobsExportQuery.Where(w => w.FlowVersion.IsPublished);
            }
            else if (exportJobsReqDto.IncludeUnpublishedFlows && !exportJobsReqDto.IncludePublishedFlows)
            {
                jobsExportQuery = jobsExportQuery.Where(w => !w.FlowVersion.IsPublished);
            }

            // Filter FlowTypes
            if (exportJobsReqDto.FlowTypes?.Any() == true)
            {
                jobsExportQuery = jobsExportQuery.Where(w => exportJobsReqDto.FlowTypes.Contains(w.FlowVersion.Flow.Type));
            }

            // Filter Priorities
            if (exportJobsReqDto.Priorities?.Any() == true)
            {
                jobsExportQuery = jobsExportQuery.Where(w => exportJobsReqDto.Priorities.Contains(w.Priority));
            }

            // Fetch the filtered jobs and project them to JobsTableRowDto for CSV export
            var jobsToExport = await jobsExportQuery
                            .Include(i => i.FlowVersion)
                                .ThenInclude(i2 => i2.Flow)
                            .ProjectToType<JobsTableRowDto>()
                            .ToListAsync();

            // Convert the retrieved data to CSV format and store it in a memory stream
            var jobsMemoryStream = CsvDataExporterUtil.ExportToCsvMemoryStream(jobsToExport);

            // Prepare the file result for export
            var jobsCsvData = new FileStreamResult(jobsMemoryStream, "text/csv")
            {
                FileDownloadName = $"jobs-data-{DateTime.UtcNow:dd-MMM-yyyy}.csv"
            };

            // Log and return the success response with the CSV file
            _logger.LogInformation("Jobs data exported. File generated: {FileName}", jobsCsvData.FileDownloadName);
            return serviceResponse.Update("Jobs exported", 200, jobsCsvData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while exporting job data.");
            return serviceResponse.Update("An error occurred while processing the export. Please try again later.", 500);
        }
    }

    // TODO: Need to check this
    // // Retrieves a list of job execution logs, excluding those with a 'Created' or 'Running' status, within the specified date range.
    // public async Task<ServiceResponse<IEnumerable<JobTableDto>>> GetJobLogsAsync(DateTimeOffset? startDate, DateTimeOffset? endDate)
    // {
    //     // Initialize the response with a default error message.
    //     var serviceResponse = new ServiceResponse<IEnumerable<JobTableDto>>
    //     {
    //         Data = null,
    //         Message = "Failed to retrieve job logs. Please try again later."
    //     };

    //     try
    //     {
    //         var dateRange = ResolveDateRange(startDate, endDate);

    //         // Fetch job execution logs, excluding 'Created' and 'Running' statuses.
    //         var jobLogs = await _unitOfWork.JobRepo
    //             .GetByConditionAsync(w =>
    //                 w.Status != JobStatusEnum.Created &&
    //                 w.Status != JobStatusEnum.Running &&
    //                 w.CreatedOn >= dateRange.StartDate.Date && w.CreatedOn < dateRange.EndDate.Date.AddDays(1)
    //             )
    //             .Include(i => i.FlowVersion)
    //                 .ThenInclude(i2 => i2.Flow)
    //             .OrderByDescending(o => o.CreatedOn)
    //             .ProjectToType<JobTableDto>()
    //             .ToListAsync();

    //         // If job logs are successfully retrieved, update the response.
    //         serviceResponse.Data = jobLogs;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Job logs retrieved successfully.";

    //         _logger.LogInformation("Successfully retrieved {JobLogCount} job logs between {StartDate} and {EndDate}.", jobLogs.Count, dateRange.StartDate, dateRange.EndDate); // Log success with count and date range
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError("Error occurred while retrieving job logs: {ErrorDetails}", ex.ToString());
    //         return serviceResponse;
    //     }

    //     return serviceResponse;
    // }

    // // Retries a failed job.
    // public async Task<ServiceResponse<bool>> RetryJobAsync(Guid jobId)
    // {
    //     var serviceResponse = new ServiceResponse<bool>
    //     {
    //         Data = false,
    //         Message = "Failed to retry job. Please try again."
    //     };

    //     try
    //     {
    //         // Retrieve the job to retry
    //         var job = await _unitOfWork.JobRepo
    //                                     .GetByConditionAsync(w =>
    //                                         w.Id == jobId)
    //                                     .SingleOrDefaultAsync();

    //         // Job does not exist
    //         if (job == null)
    //         {
    //             _logger.LogInformation($"Job with ID {jobId} does not exist or is not owned by the current user.");
    //             serviceResponse.Message = "Job does not exist or cannot be retried.";
    //             return serviceResponse;
    //         }

    //         // // Check if job is already running or completed
    //         if (job.Status != JobStatusEnum.Failed)
    //         {
    //             _logger.LogInformation($"Job with ID {jobId} cannot be retried because it is not in a failed state.");
    //             serviceResponse.Message = "Job cannot be retried because it is not in a failed state.";
    //             return serviceResponse;
    //         }

    //         // Reset the job status and set other necessary properties for retry
    //         job.Status = JobStatusEnum.Running;
    //         job.RetryCount++;

    //         // Update job in the repository
    //         _unitOfWork.JobRepo.Update(job);

    //         // Save changes
    //         if (!await _unitOfWork.SaveAsync())
    //         {
    //             _logger.LogError($"Failed to save changes while retrying job with ID {jobId}.");
    //             return serviceResponse;
    //         }

    //         // Successfully retried the job
    //         serviceResponse.Data = true;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Job retried successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex.ToString());
    //         return serviceResponse;
    //     }

    //     return serviceResponse;
    // }

    // // Cancels a running job.
    // public async Task<ServiceResponse<bool>> CancelJobAsync(Guid jobId)
    // {
    //     var serviceResponse = new ServiceResponse<bool>
    //     {
    //         Data = false,
    //         Message = "Failed to cancel job. Please try again."
    //     };

    //     try
    //     {
    //         // Retrieve the job to cancel
    //         var job = await _unitOfWork.JobRepo
    //                                     .GetByConditionAsync(w => w.Id == jobId)
    //                                     .SingleOrDefaultAsync();

    //         // Job does not exist
    //         if (job == null)
    //         {
    //             _logger.LogInformation($"Job with ID {jobId} does not exist or is not owned by the current user.");
    //             serviceResponse.Message = "Job does not exist or cannot be canceled.";
    //             return serviceResponse;
    //         }

    //         // Check if job is already completed or canceled
    //         if (job.Status == JobStatusEnum.Completed || job.Status == JobStatusEnum.Canceled)
    //         {
    //             _logger.LogInformation($"Job with ID {jobId} cannot be canceled because it is already completed or canceled.");
    //             serviceResponse.Message = "Job cannot be canceled because it is already completed or canceled.";
    //             return serviceResponse;
    //         }

    //         // Set job status to canceled
    //         job.Status = JobStatusEnum.Canceled;
    //         job.EndTime = DateTimeOffset.UtcNow;

    //         // Update job in the repository
    //         _unitOfWork.JobRepo.Update(job);

    //         // Save changes
    //         if (!await _unitOfWork.SaveAsync())
    //         {
    //             _logger.LogError($"Failed to save changes while canceling job with ID {jobId}.");
    //             return serviceResponse;
    //         }

    //         // Successfully canceled the job
    //         serviceResponse.Data = true;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Job canceled successfully.";
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex.ToString());
    //         return serviceResponse;
    //     }

    //     return serviceResponse;
    // }

    // // Aborts the job execution on a machine based on the provided job execution details.
    // public async Task<ServiceResponse<bool>> AbortJobExecutionAsync(JobAbortRequestDto jobAbortRequestDto)
    // {
    //     var serviceResponse = new ServiceResponse<bool>
    //     {
    //         Data = false,
    //         Message = "Failed to abort job execution. Please try again later."
    //     };

    //     try
    //     {
    //         // Validate the job ID to ensure it is not empty.
    //         if (jobAbortRequestDto.Id == Guid.Empty)
    //         {
    //             _logger.LogWarning("Invalid Job ID received: {JobId}. The Job ID must not be empty.", jobAbortRequestDto.Id);
    //             serviceResponse.Message = "Job ID cannot be empty.";
    //             return serviceResponse;
    //         }

    //         // Retrieve the job details based on the provided Job ID.
    //         var job = await _unitOfWork.JobRepo
    //             .GetByConditionAsync(w => w.Id == jobAbortRequestDto.Id)
    //             .SingleOrDefaultAsync();

    //         if (job == null)
    //         {
    //             // Log and return failure if no job is found with the provided Job ID.
    //             _logger.LogWarning("No job found with ID: {JobId}.", jobAbortRequestDto.Id);
    //             serviceResponse.Message = "Job not found or not assigned to any machine.";
    //             return serviceResponse;
    //         }

    //         // If the job is not running, log a warning and return failure.
    //         if (job.Status != JobStatusEnum.Running)
    //         {
    //             _logger.LogWarning("Job with ID: {JobId} is not currently running. Current status: {JobStatus}.", jobAbortRequestDto.Id, job.Status);
    //             serviceResponse.Message = "Job is not currently running, cannot abort.";
    //             return serviceResponse;
    //         }

    //         // Change the job status to "Abort" to indicate that it's being canceled.
    //         job.Status = JobStatusEnum.Abort;
    //         job.EndTime = DateTimeOffset.UtcNow;

    //         // Update job in the repository
    //         _unitOfWork.JobRepo.Update(job);

    //         // Try to save the changes to the database.
    //         if (!await _unitOfWork.SaveAsync())
    //         {
    //             // Log and return failure if the database save operation fails.
    //             _logger.LogError("Failed to save changes while aborting job with ID: {JobId}.", jobAbortRequestDto.Id);
    //             return serviceResponse;
    //         }

    //         // Create a new execution command to abort the job on the machine.
    //         var executionCommand = new ExecutionCommandDto
    //         {
    //             JobId = job.Id,
    //             MachineId = job.MachineId ?? Guid.Empty,
    //             AgentId = job.FlowVersionId,
    //             TenantId = job.TenantId,
    //             Command = ExecutionCommandTypesEnum.Abort
    //         };

    //         // Trigger the command to stop the job execution on the machine.
    //         await _jobsExecutorService.TriggerExecutionAsync(executionCommand);

    //         // Return a success response indicating that the job execution was aborted.
    //         serviceResponse.Data = true;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Job execution has been successfully aborted.";

    //         _logger.LogInformation("Job execution for Job ID: {JobId} has been successfully aborted.", jobAbortRequestDto.Id);
    //     }
    //     catch (Exception ex)
    //     {
    //         // Log any unexpected exceptions that occur during the process.
    //         _logger.LogError(ex, "An unexpected error occurred while attempting to abort job execution for Job ID: {JobId}.", jobAbortRequestDto.Id);
    //     }

    //     // Return the final response to the caller.
    //     return serviceResponse;
    // }
}