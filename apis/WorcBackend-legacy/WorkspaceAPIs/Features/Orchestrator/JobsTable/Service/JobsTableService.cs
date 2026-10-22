using System.Data;
using Microsoft.EntityFrameworkCore.Storage;

namespace WorkspaceAPIs.Services;

public class JobsTableService : IJobsTableService
{
    private readonly ILogger<JobsTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IJobsExecutorService _jobsExecutorService;
    private readonly IWebhookCallbackService _webhookCallbackService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly Guid _userId;
    private readonly string? _authHeader;
    private readonly string _displayName;
    private readonly INodeExecutionLogService _nodeExecutionLogService;
    private readonly IClientContextResolver _clientContextResolver;
    private readonly IExecutionNotificationService _executionNotificationService;
    private readonly IClientStatusStore _clientStatusStore;
    private readonly ICreditGateService _creditGateService;
    private readonly IHubContext<OrchestratorHub> _orchestratorHubContext;
    private readonly WorkspaceDbContext _workspaceDbContext;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private const int MaxRemarkLength = 2000;

    public JobsTableService(
        ILogger<JobsTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IJobsExecutorService jobsExecutorService,
        IWebhookCallbackService webhookCallbackService,
        EnvironmentConfig environmentConfig,
        INodeExecutionLogService nodeExecutionLogService,
        IClientContextResolver clientContextResolver,
        IExecutionNotificationService executionNotificationService,
        IClientStatusStore clientStatusStore,
        ICreditGateService creditGateService,
        IHubContext<OrchestratorHub> orchestratorHubContext,
        WorkspaceDbContext workspaceDbContext)
    {
        // Set the user ID from the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Forward the current request's Authorization header so calls to AccountsAPIs are authenticated.
        _authHeader = httpContextAccessor.HttpContext?.Request?.Headers["Authorization"].FirstOrDefault();

        // Capture the display name for attribution in job remarks (e.g. "Job aborted by FirstName LastName").
        _displayName = GetDisplayName(httpContextAccessor.HttpContext?.User);

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _jobsExecutorService = jobsExecutorService;
        _webhookCallbackService = webhookCallbackService;
        _environmentConfig = environmentConfig;
        _nodeExecutionLogService = nodeExecutionLogService;
        _clientContextResolver = clientContextResolver;
        _executionNotificationService = executionNotificationService;
        _clientStatusStore = clientStatusStore;
        _creditGateService = creditGateService;
        _orchestratorHubContext = orchestratorHubContext;
        _workspaceDbContext = workspaceDbContext;
        _httpContextAccessor = httpContextAccessor;
    }

    /// <summary>
    /// Returns the user's display name (First Name + Last Name) from the JWT "name" claim,
    /// falling back to the username/email claim if the name claim is missing.
    /// </summary>
    private static string GetDisplayName(System.Security.Claims.ClaimsPrincipal? user)
    {
        var name = user?.FindFirstValue(System.Security.Claims.ClaimTypes.Name)
                   ?? user?.FindFirstValue("name");
        if (!string.IsNullOrWhiteSpace(name)) return name;

        return user?.FindFirstValue("uname") ?? string.Empty;
    }

    /// <summary>
    /// Trims a remark to the maximum allowed length, adding an ellipsis when truncated.
    /// </summary>
    private static string? TruncateRemark(string? remarks)
    {
        if (string.IsNullOrWhiteSpace(remarks) || remarks.Length <= MaxRemarkLength)
            return remarks;

        return remarks[..(MaxRemarkLength - 3)] + "...";
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

            // IMPORTANT NOTE: the edition's history window wins over a wider client-supplied range.
            // The window start is a rolling timestamp, so it is compared as a timestamp instead of
            // being floored back to midnight.
            var earliestReadable = HistoryRetentionHelpers.GetEarliestReadableDate(_environmentConfig);
            var rangeStart = dateRange.StartDate.Date.ToUniversalTime();
            if (rangeStart < earliestReadable)
                rangeStart = earliestReadable.UtcDateTime;

            // Retrieve the list of records
            // Convert the resolved date range to UTC before querying. Npgsql only supports writing
            // DateTimeOffset values with offset 0 (UTC) to a 'timestamp with time zone' column, and
            // the client-supplied dates may carry a non-zero offset (e.g. +05:30).
            var jobs = await _unitOfWork.JobRepo
                        .GetByConditionAsync(w =>
                            w.CreatedOn >= rangeStart &&
                            w.CreatedOn < dateRange.EndDate.Date.AddDays(1).ToUniversalTime()
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
            var earliestReadable = HistoryRetentionHelpers.GetEarliestReadableDate(_environmentConfig);
            var jobRecord = await _unitOfWork.JobRepo
                        .GetByConditionAsync(w => w.Id == jobId && w.CreatedOn >= earliestReadable)
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

            // Populate the last node execution log for terminal jobs when logs exist.
            if (jobRecord.Status.IsTerminal())
            {
                var lastLogResponse = await _nodeExecutionLogService.GetLastNodeExecutionLogAsync(jobId);
                jobRecordDto.LastNodeLog = lastLogResponse.Data;
            }
            else
            {
                jobRecordDto.LastNodeLog = null;
            }

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
    public async Task<ServiceResponse<JobRecordDto>> InsertJobAsync(JobInsertDto jobInsertDto, Guid? providedTenantId = null)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<JobRecordDto>.Create("Failed to create job", 500);

        try
        {
            // CANNOT CREATE THE JOB: Execution is disabled for the on-prem tenant
            if (_environmentConfig.OnPremExecutionDisabled)
                return serviceResponse.Update("Execution is currently disabled. Please contact Aventisia Support.", 503);

            // IMPORTANT: TenantId is set to the current tenant's ID to ensure multi-tenancy support.
            // Since Job entity does not have IMustHaveTenant interface, we are manually setting the TenantId here
            // Due to BackgroundService creates the job and at that time the current tenant is not available using TenantResolverService
            var tenantId = _currentTenantService.CurrentTenantId;

            // Non-manual triggers require CreatedByName and CreatedById to be provided
            // TODO: Based on the trigger type we should validate if the CreatedById is correct or not
            // If you are going to validate and fetch the data using CreatedById then we don't need to get
            // CreatedByName from the request. We can fetch the name from the database based on the CreatedById.
            // But for now, we will validate both CreatedByName and CreatedById.
            // NOTE: JobInsertDto no longer carries CreatedByName/CreatedById; extend it if non-manual triggers need them.
            var isManualJobCreation = jobInsertDto.TriggerType == TriggerTypesEnum.Manual;
            if (!isManualJobCreation)
            {
                // If providedTenantId is null, return
                if (!providedTenantId.HasValue)
                    return serviceResponse.Update("Tenant ID is required for non-manual triggers.", 400);

                // Set the tenantId to the providedTenantId
                tenantId = providedTenantId.Value;
            }

            // Retrieve the FlowVersion record
            var flowVersion = await _unitOfWork.FlowVersionRepo
                                .GetByConditionAsync(w => w.Id == jobInsertDto.FlowVersionId)
                                .Select(s => new
                                {
                                    FlowName = s.Flow != null ? s.Flow.Name : "FLOW_NAME_NOT_FOUND",
                                    FlowType = s.Flow != null ? s.Flow.Type : FlowTypesEnum.Agent,
                                    FlowVersionNumber = s.VersionNumber,
                                    IsFlowVersionPublished = s.IsPublished,
                                    SupportedPlatform = s.SupportedPlatform
                                })
                                .AsNoTracking()
                                .FirstOrDefaultAsync();

            // If FlowVersion record not found, log and return
            if (flowVersion == null)
                return serviceResponse.Update("Agent not found.", 404);

            if (flowVersion.IsFlowVersionPublished && string.IsNullOrEmpty(jobInsertDto.ExecutionLocation))
                return serviceResponse.Update("Execution location is required for published agents.", 400);

            if (flowVersion.IsFlowVersionPublished
                && JobsAssignmentHelpers.IsCloudExecutionLocation(jobInsertDto.ExecutionLocation)
                && JobsAssignmentHelpers.IsCloudExecutionUnsupported(flowVersion.SupportedPlatform))
                return serviceResponse.Update("Cloud execution is not supported for this agent.", 400);

            if (!await _creditGateService.HasSufficientCreditsAsync(tenantId))
            {
                _logger.LogWarning("Blocking job creation for tenant {TenantId}: insufficient credits.", tenantId);
                return serviceResponse.Update("Insufficient credits to create this job.", 402);
            }

            // Trim the string properties in the DTO to remove any leading/trailing spaces (if applicable).
            jobInsertDto = TrimDtoStringPropsUtil.TrimDtoStringProps(jobInsertDto);

            Guid? resolvedMachineId = null;
            string? resolvedMachineName = null;
            if (flowVersion.IsFlowVersionPublished && !JobsAssignmentHelpers.IsUnassignedExecutionLocation(jobInsertDto.ExecutionLocation))
            {
                var requestedMachineName = jobInsertDto.ExecutionLocation!.Trim();

                var requestedMachine = await _unitOfWork.MachineRepo
                    .GetByConditionAsync(w =>
                        w.Name.ToLower() == requestedMachineName.ToLower())
                    .FirstOrDefaultAsync();

                if (requestedMachine == null)
                    return serviceResponse.Update("Invalid execution location.", 400);

                var isMachineMappedToFlow = await _unitOfWork.Machine_FlowVersionRepo
                    .GetByConditionAsync(w => w.MachineId == requestedMachine.Id && w.FlowVersionId == jobInsertDto.FlowVersionId)
                    .AnyAsync();

                if (!isMachineMappedToFlow)
                    return serviceResponse.Update("Machine is not assigned to this agent.", 400);

                resolvedMachineId = requestedMachine.Id;
                resolvedMachineName = requestedMachine.Name;
            }

            // Default mapping
            var newJob = jobInsertDto.Adapt<Job>();
            newJob.TenantId = tenantId; // Set the TenantId to the current or providedTenantId
            newJob.RetryCount = 0; // Default retry count to 0, will be updated below if JobId is provided

            if (resolvedMachineId.HasValue)
            {
                newJob.MachineId = resolvedMachineId;
                newJob.ExecutedOn = resolvedMachineName;
            }

            // Manual mapping: Set RetryCount (if ExistingJobId is provided)
            if (jobInsertDto.ExistingJobId.HasValue)
            {
                // Find the existing job with the same ExistingJobId and FlowVersionId to determine the retry count
                var existingJobs = await _unitOfWork.JobRepo
                                .GetByConditionAsync(w => w.Id == jobInsertDto.ExistingJobId && w.FlowVersionId == jobInsertDto.FlowVersionId)
                                .CountAsync();

                // If no existing job found, log and return
                if (existingJobs == 0)
                    return serviceResponse.Update("No existing job found.", 404);

                newJob.RetryCount = existingJobs;
            }

            // Manual mapping: Set CreatedByName and CreatedById
            if (isManualJobCreation)
            {
                // Retrieve user record
                var userRecord = await _unitOfWork.WorkspaceUserRepo
                                    .GetByConditionAsync(w => w.Id == _userId)
                                    .FirstOrDefaultAsync();

                // If user not found, log and return
                if (userRecord == null)
                    return serviceResponse.Update("User not found.", 404);

                // TODO: Property name to be changed CreatedByName = [Full name - email]
                newJob.ExecutedBy = $"{userRecord.FirstName} {userRecord.LastName} ({userRecord.UserName})";

                // TODO: Property name to be changed CreatedById = [User Id]
                newJob.RefId = userRecord.Id;
            }

            // Manual mapping: Set the ExecutionLocation for unpublished flow
            if (!flowVersion.IsFlowVersionPublished)
            {
                // TODO: Property name to be changed ExecutionLocation 
                newJob.ExecutedOn = _clientContextResolver.GetUnpublishedExecutionLocation();
            }

            // TODO: Mannual mapping till the time JobInputData is stored as JsonDocument in the database
            newJob.InputArgumentsJson = jobInsertDto.JobInputData != null ? jobInsertDto.JobInputData.RootElement.GetRawText() : null;

            // Insert job
            var jobSaved = true;

            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                await _unitOfWork.AcquireAdvisoryLockAsync(FlowVersionHistoryHelpers.HistoryLockKey(jobInsertDto.FlowVersionId));

                newJob.CreatedOn = DateTimeOffset.UtcNow;

                newJob.FlowVersionHistoryId = await _unitOfWork.FlowVersionHistoryRepo
                    .GetByConditionAsync(h => h.FlowVersionId == jobInsertDto.FlowVersionId && h.TenantId == tenantId)
                    .OrderByDescending(h => h.CreatedOn)
                    .ThenByDescending(h => h.Id)
                    .Select(h => (Guid?)h.Id)
                    .FirstOrDefaultAsync();

                await _unitOfWork.JobRepo.InsertAsync(newJob);

                jobSaved = await _unitOfWork.SaveAsync();
            });

            // Insert-Job failed, log and return
            if (!jobSaved)
                return serviceResponse.Update("Failed to save changes.", 500);

            // Map newJob to JobRecordDto for the response
            var jobRecordDto = newJob.Adapt<JobRecordDto>();
            jobRecordDto.FlowName = flowVersion.FlowName;
            jobRecordDto.FlowType = flowVersion.FlowType;
            jobRecordDto.FlowVersionNumber = $"v{flowVersion.FlowVersionNumber}";
            jobRecordDto.IsFlowVersionPublished = flowVersion.IsFlowVersionPublished;

            await _jobsExecutorService.ExecuteJobCommandAsync(newJob);

            // Return Success response
            return serviceResponse.Update("Job created", 201, jobRecordDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while inserting new job.");
            return serviceResponse;
        }
    }

    public async Task<ServiceResponse<JobRecordDto>> CreateFlowJobAsync(JobInsertDto jobInsertDto)
    {
        var serviceResponse = ServiceResponse<JobRecordDto>.Create("Failed to create job", 500);

        var tenantId = ResolveJobTenantId(jobInsertDto.ExecutionLocation);
        if (tenantId == Guid.Empty)
            return serviceResponse.Update("Tenant could not be resolved from the request.", 403);

        jobInsertDto.TriggerType = TriggerTypesEnum.Flow;
        return await InsertJobAsync(jobInsertDto, tenantId);
    }

    private Guid ResolveJobTenantId(string? executionLocation)
    {
        if (JobsAssignmentHelpers.IsCloudExecutionLocation(executionLocation))
            return _currentTenantService.CurrentTenantId;

        return MachineIdentityClaims.TryGetTenantId(_httpContextAccessor.HttpContext?.User, out var tenantId)
            ? tenantId
            : Guid.Empty;
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

            // CANNOT UPDATE THE JOB: Job is already in a terminal status
            if (job.Status.IsTerminal())
                return serviceResponse.Update("Cannot update a job that is already completed or closed.", 400);

            // Trim the string properties in the DTO
            jobUpdateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(jobUpdateDto);

            // Determine whether the job is being closed in this update.
            var isClosing = jobUpdateDto.ClosingStatus.HasValue && jobUpdateDto.ClosingStatus.Value.IsTerminal();

            // Default mapping for priority and remarks.
            jobUpdateDto.Adapt(job);

            // When the update is closing the job, run the shared close logic so credits are tracked.
            if (isClosing)
            {
                var closeResult = await CloseJobCoreAsync(job, jobUpdateDto.ClosingStatus!.Value, jobUpdateDto.Remarks, nodeExecutionLogs: []);
                if (closeResult.StatusCode != 200)
                    return closeResult;
            }
            else
            {
                // Non-closing updates should not touch the credits consumed value.
                job.CreditsConsumed = null;
            }

            // TODO: Need to check this.
            // // Checks if the job status is the same as the stored status (no change).
            // bool isStatusUnchanged = job.Status == jobUpdateDto.ClosingStatus;

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

            // For non-closing updates we still need to persist the priority/remarks changes.
            if (!isClosing)
            {
                // Update the record
                _unitOfWork.JobRepo.Update(job);

                // Update-Job failed, log and return
                if (!await _unitOfWork.SaveAsync())
                    return serviceResponse.Update("Failed to save changes.", 500);
            }

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

    // Starts a job by transitioning it from Created to Running and recording the start time.
    public async Task<ServiceResponse<JobRecordDto>> StartJobAsync(JobStartDto jobStartDto)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<JobRecordDto>.Create("Failed to start job", 500);

        try
        {
            // Ignore the global space filter: the runner authenticates without space
            // context, so a space-scoped job would be invisible. Tenant is checked explicitly.
            var job = await _unitOfWork.JobRepo
                        .GetByConditionAsync(w => w.Id == jobStartDto.Id && w.TenantId == _currentTenantService.CurrentTenantId)
                        .IgnoreQueryFilters()
                        .Include(i => i.FlowVersion)
                            .ThenInclude(i2 => i2.Flow)
                        .Include(i => i.Machine)
                        .FirstOrDefaultAsync();

            // If record not found, log and return
            if (job == null)
                return serviceResponse.Update("Job not found.", 404);

            if (!CanCallerActOnJobMachine(job))
                return serviceResponse.Update("Job is assigned to a different machine.", 403);

            // CANNOT START THE JOB: Job must be in Created status to start.
            if (job.Status != JobStatusEnum.Created)
            {
                return job.Status.IsTerminal()
                    ? serviceResponse.Update("Cannot start a job that is already completed or closed.", 409)
                    : serviceResponse.Update("Only jobs in created status can be started.", 409);
            }

            if (!await _creditGateService.HasSufficientCreditsAsync(job.TenantId))
            {
                _creditGateService.CancelForInsufficientCredits(job);
                _unitOfWork.JobRepo.Update(job);
                if (!await _unitOfWork.SaveAsync())
                    _logger.LogWarning("Failed to persist cancellation for insufficient-credit job {JobId}.", job.Id);

                _logger.LogWarning("Blocking job start for tenant {TenantId}: insufficient credits.", job.TenantId);
                return serviceResponse.Update("Insufficient credits to start this job.", 402);
            }

            // Update status and start time.
            job.Status = JobStatusEnum.Running;
            job.StartTime = DateTimeOffset.UtcNow;

            // Update the record
            _unitOfWork.JobRepo.Update(job);

            // Start-Job failed, log and return
            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("Failed to save changes.", 500);

            // The job has actually started, so the machine is now busy. This is the single source of
            // truth for the machine's Running transition: dispatch leaves the machine Online/Idle
            // (with a pending JobId) and only this method flips it to Running.
            await UpdateMachineBusyStateAsync(job);

            // Return success response
            return serviceResponse.Update("Job started", 200, job.Adapt<JobRecordDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while starting the job with ID {JobId}.", jobStartDto.Id);
            return serviceResponse;
        }
    }

    // Closes a job in a terminal status, records the end time and logs, and tracks consumed credits.
    public async Task<ServiceResponse<JobRecordDto>> CloseJobAsync(JobCloseDto jobCloseDto)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<JobRecordDto>.Create("Failed to close job", 500);

        try
        {
            // Validate the requested closing status is terminal.
            if (!jobCloseDto.ClosingStatus.IsTerminal())
                return serviceResponse.Update("Closing status must be a terminal status.", 400);

            // Ignore the global space filter: the runner authenticates without space
            // context, so a space-scoped job would be invisible. Tenant is checked explicitly.
            var job = await _unitOfWork.JobRepo
                        .GetByConditionAsync(w => w.Id == jobCloseDto.Id && w.TenantId == _currentTenantService.CurrentTenantId)
                        .IgnoreQueryFilters()
                        .Include(i => i.FlowVersion)
                            .ThenInclude(i2 => i2.Flow)
                        .Include(i => i.Machine)
                        .FirstOrDefaultAsync();

            // If record not found, log and return
            if (job == null)
                return serviceResponse.Update("Job not found.", 404);

            if (!CanCallerActOnJobMachine(job))
                return serviceResponse.Update("Job is assigned to a different machine.", 403);

            // CANNOT CLOSE THE JOB: Job is already in a terminal status
            if (job.Status.IsTerminal())
                return serviceResponse.Update("Cannot close a job that is already completed or closed.", 409);

            // Run the shared close logic.
            var closeResult = await CloseJobCoreAsync(job, jobCloseDto.ClosingStatus, jobCloseDto.Remarks, jobCloseDto.NodeExecutionLogs ?? []);
            return closeResult;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while closing the job with ID {JobId}.", jobCloseDto.Id);
            return serviceResponse;
        }
    }

    // Shared helper that closes a job, tracks credit consumption via AccountsAPIs, and saves the record.
    private async Task<ServiceResponse<JobRecordDto>> CloseJobCoreAsync(Job job, JobStatusEnum closingStatus, string? remarks, List<NodeExecutionLogDto>? nodeExecutionLogs)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<JobRecordDto>.Create("Failed to close job", 500);

        try
        {
            var now = DateTimeOffset.UtcNow;

            // Apply closure fields.
            job.Status = closingStatus;
            job.EndTime = now;

            var normalizedRemarks = TruncateRemark(remarks);
            if (!string.IsNullOrWhiteSpace(normalizedRemarks))
                job.Remark = normalizedRemarks;

            // Persist per-node execution logs from the desktop/web executor if provided.
            if (nodeExecutionLogs is { Count: > 0 })
            {
                await _nodeExecutionLogService.InsertNodeExecutionLogsAsync(job.Id, nodeExecutionLogs);
            }

            // Track credits consumed for agent execution time.
            // If the agent (flow version) has a fixed credits override configured by the
            // Super Admin (Tenants section), deduct that exact amount instead of the
            // default duration-based calculation.
            var durationSeconds = job.StartTime.HasValue
                ? Math.Ceiling((now - job.StartTime.Value).TotalSeconds)
                : 0;

            var fixedCredits = job.FlowVersion?.FixedCredits;
            var isFixedCredits = fixedCredits.HasValue && fixedCredits.Value >= 0;

            var creditUsageResponse = await RecordAgentExecutionCreditUsageAsync(job, isFixedCredits ? fixedCredits!.Value : durationSeconds, isFixedCredits);
            if (creditUsageResponse.StatusCode == 200 && creditUsageResponse.Data != null)
            {
                job.CreditsConsumed = creditUsageResponse.Data.CreditsUsed;
            }
            else
            {
                _logger.LogWarning(
                    "Credit usage tracking failed for job {JobId}. Status: {StatusCode}, Message: {Message}.",
                    job.Id, creditUsageResponse.StatusCode, creditUsageResponse.Message);
            }

            // Update the record
            _unitOfWork.JobRepo.Update(job);

            // Close-Job failed, log and return
            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("Failed to save changes.", 500);

            // Notify the initiating user (job.RefId) so the frontend can refresh the
            // credit balance immediately after the run completes. This covers the
            // runner/desktop path, which does not otherwise emit a JobCompleted signal.
            if (job.RefId.HasValue && job.RefId.Value != Guid.Empty)
            {
                await _executionNotificationService.NotifyExecutionCompletedAsync(
                    job.RefId.Value, job.Id, job.Status, job.Remark);
            }

            // The job is now finished, so the machine is free again. Reset it to Idle and broadcast
            // so the UI reflects that it can take a new job.
            await UpdateMachineIdleStateAsync(job);

            // Return success response
            return serviceResponse.Update("Job closed", 200, job.Adapt<JobRecordDto>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while closing the job with ID {JobId}.", job.Id);
            return serviceResponse;
        }
    }

    // Flips the machine executing a job to Running and notifies the tenant group that it is busy.
    // Called from StartJobAsync once the job has actually started.
    private async Task UpdateMachineBusyStateAsync(Job job)
    {
        if (job.MachineId == null || job.MachineId == Guid.Empty)
            return;

        var machine = await _clientStatusStore.GetClientByIdAsync(job.MachineId.Value);
        if (machine == null)
        {
            _logger.LogWarning("Cannot mark machine {MachineId} busy: not found in client status store.", job.MachineId);
            return;
        }

        machine.Status = MachineStatusEnum.Running;
        machine.JobId = job.Id;
        machine.AgentId = job.FlowVersionId;
        machine.LastSeen = DateTimeOffset.UtcNow;

        await _clientStatusStore.UpdateClientStatusAsync(machine);
        await _orchestratorHubContext.Clients.Group($"TENANT_{job.TenantId}").SendAsync("machine_status_update", "A machine is now busy.");
        _logger.LogInformation("Machine {MachineId} is now running job {JobId}.", job.MachineId, job.Id);
    }

    // Resets a machine to Idle after its job completes and notifies the tenant group.
    private async Task UpdateMachineIdleStateAsync(Job job)
    {
        if (job.MachineId == null || job.MachineId == Guid.Empty)
            return;

        var machine = await _clientStatusStore.GetClientByIdAsync(job.MachineId.Value);
        if (machine == null)
        {
            _logger.LogWarning("Cannot reset machine {MachineId} idle: job {JobId} not in client status store.", job.MachineId, job.Id);
            return;
        }

        machine.Status = MachineStatusEnum.Idle;
        machine.JobId = null;
        machine.AgentId = null;
        machine.LastSeen = DateTimeOffset.UtcNow;

        await _clientStatusStore.UpdateClientStatusAsync(machine);
        await _orchestratorHubContext.Clients.Group($"TENANT_{job.TenantId}").SendAsync("machine_status_update", "A machine is now idle.");
        _logger.LogInformation("Machine {MachineId} is now idle after job {JobId}.", job.MachineId, job.Id);

        // The runner polls for pending jobs after each completion, so no SignalR push is needed here.
    }

    /// <summary>
    /// Finds the oldest Created job bound to the machine or unassigned by the scheduler, assigns it to the machine, and returns the job record. Returns a successful response with null data when none is available.
    /// </summary>
    public async Task<ServiceResponse<JobRecordDto?>> GetAndAssignNextPendingJobForMachineAsync(Guid machineId)
    {
        var serviceResponse = ServiceResponse<JobRecordDto?>.Create("Failed to fetch next pending job", 500);

        try
        {
            if (!await DoesCallerMatchMachineAsync(machineId))
                return serviceResponse.Update("Machine identity does not match the requested machine.", 403);

            var tenantId = _currentTenantService.CurrentTenantId;

            var machine = await _unitOfWork.MachineRepo
                .GetByConditionAsync(w => w.Id == machineId)
                .FirstOrDefaultAsync();

            if (machine == null)
                return serviceResponse.Update("Machine not found.", 404);

            if (await _clientStatusStore.GetClientByIdAsync(machineId) == null)
                return serviceResponse.Update("Machine is not connected.", 409);

            var flowVersionIds = await _unitOfWork.Machine_FlowVersionRepo
                .GetByConditionAsync(w => w.MachineId == machineId && w.TenantId == tenantId)
                .Select(s => s.FlowVersionId)
                .ToListAsync();

            if (flowVersionIds.Count == 0)
                return serviceResponse.Update(null, 200, null);

            Job? nextJob = null;
            var insufficientCredits = false;

            await _unitOfWork.ExecuteInTransactionAsync(async () =>
            {
                // IMPORTANT NOTE: serialize concurrent polls for the same machine. The advisory lock is
                // transaction-scoped, so the second poller re-reads the machine marker after the first commits.
                await _unitOfWork.AcquireAdvisoryLockAsync(PendingJobHelpers.PendingJobPollLockKey(machineId));

                var machineStatus = await _clientStatusStore.GetClientByIdAsync(machineId);
                if (machineStatus == null)
                    return;

                if (await _unitOfWork.JobRepo.GetAllAsync().IgnoreQueryFilters().HasLivePendingJobAsync(machineStatus))
                    return;

                var lockedJobId = await LockNextBoundJobIdAsync(tenantId, machineId, flowVersionIds);

                if (lockedJobId == Guid.Empty)
                    return;

                nextJob = await _unitOfWork.JobRepo
                    .GetByConditionAsync(w => w.Id == lockedJobId)
                    .IgnoreQueryFilters()
                    .Include(i => i.FlowVersion)
                        .ThenInclude(i2 => i2!.Flow)
                    .FirstOrDefaultAsync();

                if (nextJob == null)
                    return;

                if (!await _creditGateService.HasSufficientCreditsAsync(nextJob.TenantId))
                {
                    _creditGateService.CancelForInsufficientCredits(nextJob);
                    _unitOfWork.JobRepo.Update(nextJob);
                    await _unitOfWork.SaveAsync();
                    insufficientCredits = true;
                    nextJob = null;
                    return;
                }

                // IMPORTANT NOTE: the pick locks the row, but the bind must still be conditional. A row claimed
                // between the pick and this update (or already held by another machine) yields affected 0, and the
                // loser must not report a job it does not own.
                var claimed = await _workspaceDbContext.Jobs
                    .IgnoreQueryFilters()
                    .Where(w => w.Id == nextJob.Id
                        && w.Status == JobStatusEnum.Created
                        && (w.MachineId == null || w.MachineId == Guid.Empty || w.MachineId == machineId))
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(w => w.MachineId, machineId)
                        .SetProperty(w => w.ExecutedOn, machine.Name ?? machineId.ToString()));

                if (claimed != 1)
                {
                    nextJob = null;
                    return;
                }

                nextJob.MachineId = machineId;
                nextJob.ExecutedOn = machine.Name ?? machineId.ToString();

                MachineReservationHelpers.Reserve(machineStatus, nextJob.Id, nextJob.FlowVersionId);
                await _clientStatusStore.UpdateClientStatusAsync(machineStatus);
            });

            if (insufficientCredits)
            {
                _logger.LogWarning("Blocking pending job dispatch for tenant {TenantId}: insufficient credits.", tenantId);
                return serviceResponse.Update("Insufficient credits to start a job.", 402);
            }

            if (nextJob == null)
                return serviceResponse.Update(null, 200, null);

            var jobRecordDto = nextJob.Adapt<JobRecordDto>();
            return serviceResponse.Update("Pending job found", 200, jobRecordDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while fetching the next pending job for machine {MachineId}.", machineId);
            return serviceResponse;
        }
    }

    private async Task<bool> DoesCallerMatchMachineAsync(Guid machineId)
    {
        var user = _httpContextAccessor.HttpContext?.User;

        if (MachineIdentityClaims.TryGetMachineId(user, out var callerMachineId))
            return callerMachineId == machineId;

        if (!MachineIdentityClaims.TryGetUserId(user, out var userId))
            return false;

        return await _unitOfWork.MachineRepo
            .GetByConditionAsync(w => w.Id == machineId && w.UserId == userId)
            .AnyAsync();
    }

    private bool CanCallerActOnJobMachine(Job job)
    {
        var user = _httpContextAccessor.HttpContext?.User;

        if (!MachineIdentityClaims.TryGetMachineId(user, out var callerMachineId))
            return true;

        return job.MachineId.HasValue
            && job.MachineId.Value != Guid.Empty
            && callerMachineId == job.MachineId.Value;
    }

    // IMPORTANT NOTE: must run inside an active transaction so the FOR UPDATE SKIP LOCKED lock is held until commit or rollback.
    private async Task<Guid> LockNextBoundJobIdAsync(Guid tenantId, Guid machineId, List<Guid> flowVersionIds)
    {
        var dbConnection = _workspaceDbContext.Database.GetDbConnection();
        if (dbConnection.State != ConnectionState.Open)
            await dbConnection.OpenAsync();

        await using var command = dbConnection.CreateCommand();
        command.Transaction = _workspaceDbContext.Database.CurrentTransaction?.GetDbTransaction();
        command.CommandText =
            "SELECT \"Id\" FROM \"run_Jobs\" WHERE \"TenantId\" = @tenantId AND \"Status\" = @status AND \"FlowVersionId\" = ANY(@flowVersionIds) AND (\"MachineId\" = @machineId OR ((\"MachineId\" IS NULL OR \"MachineId\" = @emptyMachineId) AND (LOWER(\"ExecutedOn\") = 'web server' OR \"TriggerType\" IN (@triggerType, @flowTriggerType)))) ORDER BY \"CreatedOn\" ASC LIMIT 1 FOR UPDATE SKIP LOCKED";

        var tenantParam = command.CreateParameter();
        tenantParam.ParameterName = "tenantId";
        tenantParam.Value = tenantId;
        command.Parameters.Add(tenantParam);

        var statusParam = command.CreateParameter();
        statusParam.ParameterName = "status";
        // IMPORTANT NOTE: "Status" is persisted as text (EnumToStringConverter<JobStatusEnum>), so the parameter must be the enum name, not its integer value.
        statusParam.Value = JobStatusEnum.Created.ToString();
        statusParam.DbType = DbType.String;
        command.Parameters.Add(statusParam);

        var machineParam = command.CreateParameter();
        machineParam.ParameterName = "machineId";
        machineParam.Value = machineId;
        command.Parameters.Add(machineParam);

        var emptyMachineParam = command.CreateParameter();
        emptyMachineParam.ParameterName = "emptyMachineId";
        emptyMachineParam.Value = Guid.Empty;
        command.Parameters.Add(emptyMachineParam);

        var flowVersionsParam = (Npgsql.NpgsqlParameter)command.CreateParameter();
        flowVersionsParam.ParameterName = "flowVersionIds";
        flowVersionsParam.Value = flowVersionIds.ToArray();
        flowVersionsParam.NpgsqlDbType = NpgsqlTypes.NpgsqlDbType.Array | NpgsqlTypes.NpgsqlDbType.Uuid;
        command.Parameters.Add(flowVersionsParam);

        var triggerTypeParam = command.CreateParameter();
        triggerTypeParam.ParameterName = "triggerType";
        // IMPORTANT NOTE: "TriggerType" is persisted as text (EnumToStringConverter<TriggerTypesEnum>), so the parameter must be the enum name, not its integer value.
        triggerTypeParam.Value = TriggerTypesEnum.Time.ToString();
        triggerTypeParam.DbType = DbType.String;
        command.Parameters.Add(triggerTypeParam);

        var flowTriggerTypeParam = command.CreateParameter();
        flowTriggerTypeParam.ParameterName = "flowTriggerType";
        // IMPORTANT NOTE: "TriggerType" is persisted as text (EnumToStringConverter<TriggerTypesEnum>), so the parameter must be the enum name, not its integer value.
        flowTriggerTypeParam.Value = TriggerTypesEnum.Flow.ToString();
        flowTriggerTypeParam.DbType = DbType.String;
        command.Parameters.Add(flowTriggerTypeParam);

        var result = await command.ExecuteScalarAsync();
        return result is Guid jobId ? jobId : Guid.Empty;
    }

    // Aborts a running job by transitioning it to Aborted, recording the end time, and sending an Abort command to the executing machine.
    public async Task<ServiceResponse<bool>> AbortJobExecutionAsync(JobAbortRequestDto jobAbortRequestDto)
    {
        // Initialize the response with a default error message.
        var serviceResponse = ServiceResponse<bool>.Create("Failed to abort job execution", 500);

        try
        {
            // Validate the job ID to ensure it is not empty.
            if (jobAbortRequestDto.Id == Guid.Empty)
            {
                _logger.LogWarning("Invalid Job ID received: {JobId}. The Job ID must not be empty.", jobAbortRequestDto.Id);
                return serviceResponse.Update("Job ID cannot be empty.", 400);
            }

            // Ignore the global space filter: the runner authenticates without space
            // context, so a space-scoped job would be invisible. Tenant is checked explicitly.
            var job = await _unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == jobAbortRequestDto.Id && w.TenantId == _currentTenantService.CurrentTenantId)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (job == null)
                return serviceResponse.Update("Job not found.", 404);

            if (!CanCallerActOnJobMachine(job))
                return serviceResponse.Update("Job is assigned to a different machine.", 403);

            // CANNOT ABORT THE JOB: Job is not running.
            if (job.Status != JobStatusEnum.Running)
                return serviceResponse.Update("Only running jobs can be aborted.", 400);

            // Set the job status to Aborted and record the end time.
            job.Status = JobStatusEnum.Aborted;
            job.EndTime = DateTimeOffset.UtcNow;

            // Record an attribution remark when the user name is available.
            var abortRemark = !string.IsNullOrWhiteSpace(_displayName)
                ? $"Job aborted by {_displayName}."
                : "Job aborted.";
            job.Remark = TruncateRemark(abortRemark);

            // Update the job in the repository.
            _unitOfWork.JobRepo.Update(job);

            // Abort-Job failed, log and return.
            if (!await _unitOfWork.SaveAsync())
                return serviceResponse.Update("Failed to save changes.", 500);

            // Send an Abort command to the machine executing the job, if any.
            if (job.MachineId != null && job.MachineId != Guid.Empty)
            {
                var executionCommand = new ExecutionCommandDto
                {
                    JobId = job.Id,
                    MachineName = job.ExecutedOn ?? job.MachineId.Value.ToString(),
                    AgentId = job.FlowVersionId,
                    TenantId = job.TenantId,
                    Command = ExecutionCommandTypesEnum.Abort
                };

                await _jobsExecutorService.TriggerExecutionAsync(executionCommand);
            }

            return serviceResponse.Update("Job execution aborted", 200, true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while aborting the job with ID {JobId}.", jobAbortRequestDto.Id);
            return serviceResponse;
        }
    }

    // Posts a single credit usage record to AccountsAPIs for agent execution time.
    // When isFixedCredits is true, consumedUnits is treated as a fixed credit amount
    // that supersedes the default unit-based deduction.
    private async Task<ServiceResponse<RecordedCreditUsageDto>> RecordAgentExecutionCreditUsageAsync(Job job, double consumedUnits, bool isFixedCredits = false)
    {
        var serviceResponse = ServiceResponse<RecordedCreditUsageDto>.Create("Failed to record credit usage.", 500);

        try
        {
            var accountsApiBaseUrl = _environmentConfig.AccountsApiBaseUrl;
            if (string.IsNullOrWhiteSpace(accountsApiBaseUrl))
                return serviceResponse.Update("Accounts API base URL is not configured.", 500);

            var flowName = job.FlowVersion?.Flow?.Name ?? "Unknown Agent";

            var payload = new
            {
                ServiceType = CreditServicesEnum.AgentExecutionTime,
                ConsumedUnit = consumedUnits,
                IsFixedCredits = isFixedCredits,
                RefType = UsageSourceTypesEnum.Agent,
                RefId = job.FlowVersionId,
                RefName = flowName,
                UsedByUserId = _userId,
                SpaceId = job.SpaceId,
                Action = ActionTypesEnum.AgentExecution,
                TriggeredByAgent = flowName
            };

            // In local development the AccountsAPIs dev certificate is untrusted, so
            // bypass SSL validation to allow the cross-API credit recording to succeed.
            using var httpClient = new HttpClient(new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
            });
            httpClient.Timeout = TimeSpan.FromSeconds(30);

            if (!string.IsNullOrWhiteSpace(_authHeader))
                httpClient.DefaultRequestHeaders.Add("Authorization", _authHeader);

            var response = await httpClient.PostAsJsonAsync($"{accountsApiBaseUrl.TrimEnd('/')}/credit-usage", payload);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "AccountsAPIs credit-usage endpoint returned {StatusCode} for job {JobId}. Response: {Response}.",
                    (int)response.StatusCode, job.Id, responseBody);
                return serviceResponse.Update("Credit usage tracking endpoint returned an error.", (int)response.StatusCode);
            }

            var recordedUsage = System.Text.Json.JsonSerializer.Deserialize<ServiceResponse<RecordedCreditUsageDto>>(responseBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                Converters = { new JsonStringEnumConverter() }
            });

            if (recordedUsage == null)
                return serviceResponse.Update("Unable to parse credit usage response.", 500);

            return recordedUsage;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while recording credit usage for job {JobId}.", job.Id);
            return serviceResponse;
        }
    }

    // Gets the fixed credits override configured for an agent (flow version).
    // Returns null when no override is set, meaning the default credit deduction applies.
    public async Task<ServiceResponse<double?>> GetAgentFixedCreditsAsync(Guid flowVersionId)
    {
        var serviceResponse = ServiceResponse<double?>.Create("Failed to retrieve fixed credits.", 500);

        try
        {
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == flowVersionId)
                .FirstOrDefaultAsync();

            if (flowVersion == null)
            {
                serviceResponse.Message = "Agent not found.";
                return serviceResponse;
            }

            serviceResponse.Data = flowVersion.FixedCredits;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Fixed credits retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving fixed credits for agent {FlowVersionId}.", flowVersionId);
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<FlowJobStatusDto>> GetFlowJobStatusAsync(Guid jobId)
    {
        var serviceResponse = ServiceResponse<FlowJobStatusDto>.Create("Failed to fetch job status", 401);

        if (!MachineIdentityClaims.TryGetTenantId(_httpContextAccessor.HttpContext?.User, out var tenantId))
            return serviceResponse.Update("Machine credentials are required.", 403);

        try
        {
            var job = await _unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == jobId && w.TenantId == tenantId)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // If record not found, log and return
            if (job == null)
                return serviceResponse.Update("Job not found.", 404);

            return serviceResponse.Update(null, 200, new FlowJobStatusDto
            {
                Id = job.Id,
                Status = job.Status,
                OutputDataJson = job.OutputDataJson
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving job status for Job ID {jobId}.", jobId);
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
            // Convert the resolved date range to UTC before querying. Npgsql only supports writing
            // DateTimeOffset values with offset 0 (UTC) to a 'timestamp with time zone' column, and
            // the client-supplied dates may carry a non-zero offset (e.g. +05:30).
            var jobsExportQuery = _unitOfWork.JobRepo
                                    .GetByConditionAsync(w =>
                                        w.StartTime >= dateRange.StartDate.Date.ToUniversalTime() &&
                                        w.StartTime < dateRange.EndDate.Date.AddDays(1).ToUniversalTime()
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

            // Return the success response with the CSV file
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
