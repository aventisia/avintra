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
    private readonly string? _username;

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
        _username = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? string.Empty;

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _jobsExecutorService = jobsExecutorService;
        _webhookCallbackService = webhookCallbackService;
        _environmentConfig = environmentConfig;
    }

    // Retrieves a list of jobs within the specified date range, or defaults to the last 7 days if no dates are provided.
    public async Task<ServiceResponse<IEnumerable<JobTableDto>>> GetJobsAsync(DateTimeOffset? startDate, DateTimeOffset? endDate, bool includeLogs)
    {
        // Initialize the response with a default error message.
        var serviceResponse = new ServiceResponse<IEnumerable<JobTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve jobs. Please try again later."
        };

        try
        {
            // If no date filters are provided, default to the last 7 days.
            if (!startDate.HasValue || !endDate.HasValue)
            {
                startDate = DateTime.UtcNow.Date.AddDays(-6);
                endDate = DateTime.UtcNow.Date;
            }

            // Fetch jobs from the repository with the provided date filters.
            var jobs = await _unitOfWork.JobRepo
                .GetByConditionAsync(w =>
                    w.CreatedOn.Date >= startDate.Value &&
                    w.CreatedOn.Date <= endDate.Value
                )
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .OrderByDescending(o => o.CreatedOn)
                .ProjectToType<JobTableDto>()
                .ToListAsync();

            // If the 'includeLogs' flag is false, clear the 'NodeExecutionLogs' for each job
            if (!includeLogs)
                jobs.ForEach(j => j.NodeExecutionLogs = string.Empty);  // Set NodeExecutionLogs to an empty string for all jobs

            // If jobs are successfully retrieved, update the response.
            serviceResponse.Data = jobs;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Jobs retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {JobCount} jobs between {StartDate} and {EndDate}.", jobs.Count, startDate, endDate);
        }
        catch (Exception ex)
        {
            _logger.LogError("Error occurred while retrieving jobs: {ErrorDetails}", ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a list of job execution logs, excluding those with a 'Created' or 'Running' status, within the specified date range.
    public async Task<ServiceResponse<IEnumerable<JobTableDto>>> GetJobLogsAsync(DateTimeOffset? startDate, DateTimeOffset? endDate)
    {
        // Initialize the response with a default error message.
        var serviceResponse = new ServiceResponse<IEnumerable<JobTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve job logs. Please try again later."
        };

        try
        {
            // If no date filters are provided, default to the last 7 days.
            if (!startDate.HasValue || !endDate.HasValue)
            {
                startDate = DateTime.UtcNow.Date.AddDays(-6);
                endDate = DateTime.UtcNow.Date;
            }

            // Fetch job execution logs, excluding 'Created' and 'Running' statuses.
            var jobLogs = await _unitOfWork.JobRepo
                .GetByConditionAsync(w =>
                    w.Status != JobStatusTypesEnum.Created &&
                    w.Status != JobStatusTypesEnum.Running &&
                    w.CreatedOn.Date >= startDate.Value && w.CreatedOn.Date <= endDate.Value
                )
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .OrderByDescending(o => o.CreatedOn)
                .ProjectToType<JobTableDto>()
                .ToListAsync();

            // If job logs are successfully retrieved, update the response.
            serviceResponse.Data = jobLogs;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job logs retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {JobLogCount} job logs between {StartDate} and {EndDate}.", jobLogs.Count, startDate, endDate); // Log success with count and date range
        }
        catch (Exception ex)
        {
            _logger.LogError("Error occurred while retrieving job logs: {ErrorDetails}", ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a specific job by its ID for the current user.
    public async Task<ServiceResponse<JobTableDto>> GetJobByIdAsync(Guid jobId)
    {
        // Initialize ServiceResponse with an error message.
        var serviceResponse = new ServiceResponse<JobTableDto>
        {
            Data = null,
            Message = "Failed to retrieve the job. Please try again."
        };

        try
        {
            // Fetch a specific job created by the current user
            var job = await _unitOfWork.JobRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == jobId
                                        )
                                        .ProjectToType<JobTableDto>()
                                        .FirstOrDefaultAsync();

            // Success - set the response with retrieved job
            serviceResponse.Data = job;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves the details of a specific job by its ID for the current user.
    public async Task<ServiceResponse<JobDetailDto>> GetJobDetailByIdAsync(Guid jobId)
    {
        var serviceResponse = new ServiceResponse<JobDetailDto>
        {
            Data = null,
            Message = "Failed to retrieve job details. Please try again later."
        };

        try
        {
            // Attempt to fetch the job details from the repository
            var job = await _unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == jobId)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .OrderByDescending(w => w.CreatedOn)
                .ProjectToType<JobDetailDto>()
                .SingleOrDefaultAsync();

            // If job not found, log and return a "not found" response
            if (job == null)
            {
                _logger.LogWarning($"Job not found for Job ID: {jobId}");
                serviceResponse.Message = "Job not found.";
                serviceResponse.StatusCode = 404; // Not Found
                return serviceResponse;
            }

            // If job is found, log success and return job details
            _logger.LogInformation($"Job details retrieved successfully for Job ID: {jobId}");

            serviceResponse.Data = job;
            serviceResponse.StatusCode = 200; // OK
            serviceResponse.Message = "Job details retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the error and return a failed response
            _logger.LogError($"Error retrieving job details for Job ID {jobId}: {ex}");
        }

        return serviceResponse;
    }

    // Adds a new job.
    public async Task<ServiceResponse<JobTableDto>> InsertJobAsync(JobTableDto jobTableDto)
    {
        // Initialize ServiceResponse with an error message.
        var serviceResponse = new ServiceResponse<JobTableDto>
        {
            Data = null,
            Message = "Failed to add the job. Please try again."
        };

        try
        {
            // Check if execution is disabled in the current environment.
            if (_environmentConfig.OnPremExecutionDisabled)
            {
                // Set the service response message to inform the user about execution being disabled.
                serviceResponse.Message = "Execution is currently disabled. Please contact Aventisia Support for assistance.";
                _logger.LogError("Execution is currently disabled in this environment. Job processing cannot be performed.");
                return serviceResponse;
            }

            // Retrieve the flow version associated with the job using the FlowVersionId from the DTO.
            var flowVersion = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == jobTableDto.FlowVersionId)
                    .Include(i => i.FlowVersionHistories)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

            if (flowVersion == null)
            {
                // If the flow version is not found, log the event and return an error message.
                _logger.LogError("Flow version not found with ID: {FlowVersionId}", jobTableDto.FlowVersionId);
                serviceResponse.Message = "The flow version was not found.";
                return serviceResponse;
            }

            // Trim the string properties in the DTO to remove any leading/trailing spaces (if applicable).
            jobTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(jobTableDto);

            // If the OSId is provided, attempt to find a matching machine.
            if (!string.IsNullOrEmpty(jobTableDto.OSId))
            {
                var machine = await _unitOfWork.MachineRepo
                    .GetByConditionAsync(w =>
                        w.OSId.ToLower() == jobTableDto.OSId.ToLower())
                    .FirstOrDefaultAsync();

                // Log the outcome of the machine search.
                if (machine != null)
                {
                    // If a machine is found, assign its ID to the job DTO.
                    jobTableDto.MachineId = machine.Id;
                    _logger.LogInformation("Machine found with ID: {MachineId}", machine.Id);
                }
                else
                {
                    _logger.LogWarning("No machine found with OSId: {OSId}", jobTableDto.OSId);
                }
            }

            // Convert the incoming DTO into a new Job entity
            var newJob = new Job()
            {
                TenantId = _currentTenantService.CurrentTenantId,
                FlowVersionId = jobTableDto.FlowVersionId,
                TriggerType = jobTableDto.TriggerType,
                MachineId = jobTableDto.MachineId,
                Priority = jobTableDto.Priority,
                Status = JobStatusTypesEnum.Created,
                CreatedOn = DateTimeOffset.UtcNow,
                IsPublished = flowVersion.IsPublished,
                FlowVersionHistoryId = flowVersion.FlowVersionHistories
                    .OrderByDescending(o => o.CreatedOn)
                    .Select(s => (Guid?)s.Id)
                    .FirstOrDefault()
            };

            // If the flow version is NOT published, allow the caller to explicitly control job execution details
            if (!flowVersion.IsPublished)
            {
                newJob.Status = jobTableDto.Status;
                newJob.StartTime = jobTableDto.StartTime;
                newJob.EndTime = jobTableDto.EndTime;
                newJob.NodeExecutionLogs = jobTableDto.NodeExecutionLogs;
            }

            // Insert the new job into the repository
            await _unitOfWork.JobRepo.InsertAsync(newJob);

            // Check if changes were successfully saved
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while inserting new job.");
                return serviceResponse;
            }

            // If the flow version is published, trigger the job execution.
            if (newJob.IsPublished)
            {
                // Execute the job asynchronously.
                await _jobsExecutorService.ExecuteJobCommandAsync(newJob);
            }

            newJob = await _unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == newJob.Id)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .SingleOrDefaultAsync();

            // Success - return the created job
            serviceResponse.Data = newJob.Adapt<JobTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing job.
    public async Task<ServiceResponse<JobTableDto>> UpdateJobAsync(JobTableDto jobTableDto)
    {
        // Initialize ServiceResponse with an error message.
        var serviceResponse = new ServiceResponse<JobTableDto>
        {
            Data = null,
            Message = "Failed to update the job. Please try again."
        };

        try
        {

            // Fetch the job that needs to be updated
            var job = await _unitOfWork.JobRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == jobTableDto.Id &&
                                            w.FlowVersionId == jobTableDto.FlowVersionId
                                        )
                                        .Include(i => i.Machine)
                                        .SingleOrDefaultAsync();

            // If the job does not exist, return error message
            if (job == null)
            {
                _logger.LogInformation("Job does not exist.");
                serviceResponse.Message = "Job does not exist.";
                return serviceResponse;
            }

            // Retrieve the flow version associated with the job using the FlowVersionId from the DTO.
            var flowVersion = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == job.FlowVersionId)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

            if (flowVersion == null)
            {
                // If the flow version is not found, log the event and return an error message.
                _logger.LogError("Flow version not found with ID: {FlowVersionId}", job.FlowVersionId);
                serviceResponse.Message = "The flow version was not found.";
                return serviceResponse;
            }

            // Checks if the job status is the same as the stored status (no change).
            bool isStatusUnchanged = job.Status == jobTableDto.Status;

            // Trim the string properties in the DTO
            jobTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(jobTableDto);

            // Map the updated values from DTO to the job entity
            jobTableDto.Adapt(job);
            job.IsPublished = flowVersion.IsPublished;

            // Set "ExecutedBy" only if it has not already been populated.
            // Priority logic:
            // 1. Manual trigger → use the current username.
            // 2. Non-manual triggers → use machine name if available.
            // TODO: Handle additional TriggerTypesEnum cases (e.g., API, Event, Scheduler) to ensure proper attribution for all execution sources.
            if (string.IsNullOrEmpty(job.ExecutedBy))
            {
                if (job.TriggerType == TriggerTypesEnum.ManualTrigger)
                    job.ExecutedBy = _username;
                else
                    job.ExecutedBy = job.Machine != null ? job.Machine.Name : null;
            }

            // If the job status is "Running", set the StartTime to the current UTC time.
            if (job.Status == JobStatusTypesEnum.Running)
                job.StartTime = DateTimeOffset.UtcNow;

            // If the job status is "Canceled", "Abort", "Completed", or "Failed", set the EndTime to the current UTC time.
            if (job.Status == JobStatusTypesEnum.Canceled || job.Status == JobStatusTypesEnum.Abort || job.Status == JobStatusTypesEnum.Completed || job.Status == JobStatusTypesEnum.Failed)
                job.EndTime = DateTimeOffset.UtcNow;
            // Update the job in the repository
            _unitOfWork.JobRepo.Update(job);

            // Check if changes were successfully saved
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating job.");
                return serviceResponse;
            }

            // If the job status has changed (i.e., it differs from the previously stored status), proceed with the action.
            if (!isStatusUnchanged && job.IsPublished)
            {
                // Create a new ExecutionCommandDto to determine which action to trigger based on job status.
                var executionCommand = new ExecutionCommandDto()
                {
                    JobId = job.Id,
                    MachineId = job.MachineId ?? Guid.Empty,
                    AgentId = job.FlowVersionId,
                    TenantId = job.TenantId
                };

                // Switch statement to set the correct execution command based on the job's current status.
                switch (job.Status)
                {
                    case JobStatusTypesEnum.Completed:
                        executionCommand.Command = ExecutionCommandTypesEnum.Cleanup;
                        break;

                    case JobStatusTypesEnum.Failed:
                    case JobStatusTypesEnum.Canceled:
                        executionCommand.Command = ExecutionCommandTypesEnum.Cancel;
                        break;

                    case JobStatusTypesEnum.Abort:
                        executionCommand.Command = ExecutionCommandTypesEnum.Abort;
                        break;

                    case JobStatusTypesEnum.Paused:
                        executionCommand.Command = ExecutionCommandTypesEnum.Pause;
                        break;

                    case JobStatusTypesEnum.Resumed:
                        executionCommand.Command = ExecutionCommandTypesEnum.Resume;
                        break;

                    case JobStatusTypesEnum.Retrying:
                    case JobStatusTypesEnum.Running:
                        executionCommand.Command = ExecutionCommandTypesEnum.Execute;
                        break;

                    default:
                        executionCommand.Command = ExecutionCommandTypesEnum.Cleanup;
                        break;
                }

                // Trigger the appropriate execution command for the job.
                await _jobsExecutorService.TriggerExecutionAsync(executionCommand);
            }

            // TODO: Populate and send custom response data (e.g., job result, status details, timestamps) to the callback URL            // Fire webhook callback if this is a webhook-triggered job that has reached a terminal state
            if (job.TriggerType == TriggerTypesEnum.WebhookTrigger &&
                (job.Status == JobStatusTypesEnum.Completed ||
                 job.Status == JobStatusTypesEnum.Failed ||
                 job.Status == JobStatusTypesEnum.Canceled))
            {
                _ = Task.Run(async () =>
                {
                    try { await _webhookCallbackService.SendCallbackAsync(job); }
                    catch (Exception cbEx) { _logger.LogError(cbEx, "Webhook callback error for job {JobId}.", job.Id); }
                });
            }

            // Success - return the updated job
            serviceResponse.Data = job.Adapt<JobTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a job by its ID.
    public async Task<ServiceResponse<bool>> DeleteJobAsync(Guid jobId)
    {
        // Initialize ServiceResponse with an error message.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the job. Please try again."
        };

        try
        {
            // Fetch the job to be deleted
            var job = await _unitOfWork.JobRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == jobId)
                                        .SingleOrDefaultAsync();

            // If the job does not exist, return error message
            if (job == null)
            {
                _logger.LogInformation("Job does not exist.");
                serviceResponse.Message = "Job does not exist.";
                return serviceResponse;
            }

            // Delete the job from the repository
            _unitOfWork.JobRepo.Delete(job);

            // Check if changes were successfully saved
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting job.");
                return serviceResponse;
            }

            // Success - return confirmation
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple jobs by their IDs.
    public async Task<ServiceResponse<bool>> DeleteJobsAsync(IEnumerable<Guid> jobIds)
    {
        // Initialize ServiceResponse with an error message.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the jobs. Please try again."
        };

        try
        {
            // Fetch the jobs to be deleted
            var jobs = await _unitOfWork.JobRepo
                                            .GetByConditionAsync(w =>
                                                jobIds.Contains(w.Id))
                                            .ToListAsync();

            // If no jobs found, return error message
            if (jobs.Count == 0)
            {
                _logger.LogInformation("Jobs do not exist.");
                serviceResponse.Message = "Jobs do not exist.";
                return serviceResponse;
            }

            // Delete the jobs from the repository
            _unitOfWork.JobRepo.Delete(jobs);

            // Check if changes were successfully saved
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting jobs.");
                return serviceResponse;
            }

            // Success - return confirmation with the count of deleted jobs
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{jobIds.Count()} jobs deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retries a failed job.
    public async Task<ServiceResponse<bool>> RetryJobAsync(Guid jobId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to retry job. Please try again."
        };

        try
        {
            // Retrieve the job to retry
            var job = await _unitOfWork.JobRepo
                                        .GetByConditionAsync(w =>
                                            w.Id == jobId)
                                        .SingleOrDefaultAsync();

            // Job does not exist
            if (job == null)
            {
                _logger.LogInformation($"Job with ID {jobId} does not exist or is not owned by the current user.");
                serviceResponse.Message = "Job does not exist or cannot be retried.";
                return serviceResponse;
            }

            // // Check if job is already running or completed
            if (job.Status != JobStatusTypesEnum.Failed)
            {
                _logger.LogInformation($"Job with ID {jobId} cannot be retried because it is not in a failed state.");
                serviceResponse.Message = "Job cannot be retried because it is not in a failed state.";
                return serviceResponse;
            }

            // Reset the job status and set other necessary properties for retry
            job.Status = JobStatusTypesEnum.Running;
            job.RetryCount++;

            // Update job in the repository
            _unitOfWork.JobRepo.Update(job);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save changes while retrying job with ID {jobId}.");
                return serviceResponse;
            }

            // Successfully retried the job
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job retried successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Cancels a running job.
    public async Task<ServiceResponse<bool>> CancelJobAsync(Guid jobId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to cancel job. Please try again."
        };

        try
        {
            // Retrieve the job to cancel
            var job = await _unitOfWork.JobRepo
                                        .GetByConditionAsync(w => w.Id == jobId)
                                        .SingleOrDefaultAsync();

            // Job does not exist
            if (job == null)
            {
                _logger.LogInformation($"Job with ID {jobId} does not exist or is not owned by the current user.");
                serviceResponse.Message = "Job does not exist or cannot be canceled.";
                return serviceResponse;
            }

            // Check if job is already completed or canceled
            if (job.Status == JobStatusTypesEnum.Completed || job.Status == JobStatusTypesEnum.Canceled)
            {
                _logger.LogInformation($"Job with ID {jobId} cannot be canceled because it is already completed or canceled.");
                serviceResponse.Message = "Job cannot be canceled because it is already completed or canceled.";
                return serviceResponse;
            }

            // Set job status to canceled
            job.Status = JobStatusTypesEnum.Canceled;
            job.EndTime = DateTimeOffset.UtcNow;

            // Update job in the repository
            _unitOfWork.JobRepo.Update(job);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save changes while canceling job with ID {jobId}.");
                return serviceResponse;
            }

            // Successfully canceled the job
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job canceled successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Aborts the job execution on a machine based on the provided job execution details.
    public async Task<ServiceResponse<bool>> AbortJobExecutionAsync(JobExecutionDto jobExecutionDto)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to abort job execution. Please try again later."
        };

        try
        {
            // Validate the job ID to ensure it is not empty.
            if (jobExecutionDto.Id == Guid.Empty)
            {
                _logger.LogWarning("Invalid Job ID received: {JobId}. The Job ID must not be empty.", jobExecutionDto.Id);
                serviceResponse.Message = "Job ID cannot be empty.";
                return serviceResponse;
            }

            // Retrieve the job details based on the provided Job ID.
            var job = await _unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == jobExecutionDto.Id)
                .SingleOrDefaultAsync();

            if (job == null)
            {
                // Log and return failure if no job is found with the provided Job ID.
                _logger.LogWarning("No job found with ID: {JobId}.", jobExecutionDto.Id);
                serviceResponse.Message = "Job not found or not assigned to any machine.";
                return serviceResponse;
            }

            // If the job is not running, log a warning and return failure.
            if (job.Status != JobStatusTypesEnum.Running)
            {
                _logger.LogWarning("Job with ID: {JobId} is not currently running. Current status: {JobStatus}.", jobExecutionDto.Id, job.Status);
                serviceResponse.Message = "Job is not currently running, cannot abort.";
                return serviceResponse;
            }

            // Change the job status to "Abort" to indicate that it's being canceled.
            job.Status = JobStatusTypesEnum.Abort;
            job.EndTime = DateTimeOffset.UtcNow;

            // Update job in the repository
            _unitOfWork.JobRepo.Update(job);

            // Try to save the changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                // Log and return failure if the database save operation fails.
                _logger.LogError("Failed to save changes while aborting job with ID: {JobId}.", jobExecutionDto.Id);
                return serviceResponse;
            }

            // Create a new execution command to abort the job on the machine.
            var executionCommand = new ExecutionCommandDto
            {
                JobId = job.Id,
                MachineId = job.MachineId ?? Guid.Empty,
                AgentId = job.FlowVersionId,
                TenantId = job.TenantId,
                Command = ExecutionCommandTypesEnum.Abort
            };

            // Trigger the command to stop the job execution on the machine.
            await _jobsExecutorService.TriggerExecutionAsync(executionCommand);

            // Return a success response indicating that the job execution was aborted.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job execution has been successfully aborted.";

            _logger.LogInformation("Job execution for Job ID: {JobId} has been successfully aborted.", jobExecutionDto.Id);
        }
        catch (Exception ex)
        {
            // Log any unexpected exceptions that occur during the process.
            _logger.LogError(ex, "An unexpected error occurred while attempting to abort job execution for Job ID: {JobId}.", jobExecutionDto.Id);
        }

        // Return the final response to the caller.
        return serviceResponse;
    }

    public async Task<ServiceResponse<FileStreamResult>> ExportJobsAsync(ExportJobRequestDto exportJobRequestDto)
    {
        // Initialize ServiceResponse with a failure response
        var serviceResponse = new ServiceResponse<FileStreamResult>
        {
            Data = null,
            Message = "Failed to export job data. Please try again."
        };

        try
        {
            // Check if StartDate or EndDate are not provided (null)
            if (!exportJobRequestDto.StartDate.HasValue || !exportJobRequestDto.EndDate.HasValue)
            {
                // Set default values if dates are missing
                exportJobRequestDto.EndDate = DateTime.UtcNow.Date;
                exportJobRequestDto.StartDate = DateTime.UtcNow.Date.AddDays(-6);
            }

            // Initialize the base query with date filter
            var jobQuery = _unitOfWork.JobRepo
                .GetByConditionAsync(w =>
                    w.CreatedOn.Date >= exportJobRequestDto.StartDate.Value.Date &&
                    w.CreatedOn.Date <= exportJobRequestDto.EndDate.Value.Date
                )
                .OrderByDescending(o => o.CreatedOn)
                .AsQueryable();

            // Apply filters based on optional criteria in the request DTO

            // Filter by Job Status if specified
            if (exportJobRequestDto.Status.HasValue)
            {
                jobQuery = jobQuery.Where(w => w.Status == exportJobRequestDto.Status.Value);
            }

            // Filter by Job Priority if specified
            if (exportJobRequestDto.Priority.HasValue)
            {
                jobQuery = jobQuery.Where(w => w.Priority == exportJobRequestDto.Priority.Value);
            }

            // Filter by Machine IDs if provided
            if (exportJobRequestDto.MachineIds?.Any() == true)
            {
                jobQuery = jobQuery.Where(w => w.MachineId != null && exportJobRequestDto.MachineIds.Contains(w.MachineId ?? Guid.Empty));
            }

            // Filter by Agent IDs if provided
            if (exportJobRequestDto.AgentIds?.Any() == true)
            {
                jobQuery = jobQuery.Where(w => exportJobRequestDto.AgentIds.Contains(w.FlowVersionId));
            }

            // Fetch and map filtered jobs to DTOs for export
            var jobs = await jobQuery
                .Include(i => i.Machine)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .ProjectToType<ExportJobResponseDto>()
                .ToListAsync();

            // Log the count of jobs being exported
            _logger.LogInformation("Exporting {Count} job(s) based on applied filters.", jobs.Count);

            // Convert the retrieved data to CSV byte array for file export
            var csvBytes = CsvDataExporterUtil.ExportToCsvBytes(jobs, new List<string>
            {
                "Job Name",
                "Priority",
                "Trigger Type",
                "Start Time",
                "End Time",
                "Duration",
                "Retry",
                "Current Status",
                "Machine Name",
                "Created On",
            });

            var stream = new MemoryStream(csvBytes);

            // Prepare the file result for export
            var fileResult = new FileStreamResult(stream, "text/csv")
            {
                FileDownloadName = $"job-data-{DateTime.UtcNow:dd-MM-yyyy}.csv"
            };

            // Update the service response with the file stream
            serviceResponse.Data = fileResult;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Job data exported successfully.";

            _logger.LogInformation("Job export completed. File generated: {FileName}", fileResult.FileDownloadName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while exporting job data.");
            serviceResponse.Message = "An error occurred while processing the export. Please try again later.";
        }

        return serviceResponse;
    }
}