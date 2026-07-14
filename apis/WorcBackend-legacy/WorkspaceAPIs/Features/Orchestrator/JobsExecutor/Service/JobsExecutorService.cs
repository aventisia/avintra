namespace WorkspaceAPIs.Services;

public class JobsExecutorService : IJobsExecutorService
{
    private readonly ILogger<IJobsExecutorService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;
    private readonly IHubContext<OrchestratorHub> _hubContext;
    private readonly IClientStatusStore _clientStatusStore;

    private readonly Guid _userId;

    // Constructor
    public JobsExecutorService(
        ILogger<JobsExecutorService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IHubContext<OrchestratorHub> hubContext,
        IClientStatusStore clientStatusStore,
        WorkspaceInternalDbContext workspaceInternalDbContext)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _hubContext = hubContext;
        _clientStatusStore = clientStatusStore;
        _workspaceInternalDbContext = workspaceInternalDbContext;
    }

    // Method to execute a job command
    public async Task ExecuteJobCommandAsync(Job job)
    {
        _logger.LogInformation("Fetching connection ID for user: {UserId}", _userId);

        try
        {
            // Validate the job object
            if (job == null || job.Id == Guid.Empty)
            {
                _logger.LogWarning("Invalid job data for Job ID: {JobId}.", job?.Id);
                return;
            }

            // Retrieve job details, including FlowVersion, from the database
            var jobDetails = await _unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == job.Id)
                .Include(i => i.FlowVersion)
                .SingleOrDefaultAsync();

            if (jobDetails == null)
            {
                _logger.LogWarning("Job {JobId} not found in the database.", job.Id);
                return;
            }

            _logger.LogInformation("Preparing job execution for Job ID: {JobId}, FlowVersion ID: {FlowVersionId}", job.Id, jobDetails.FlowVersion.Id);

            // Determine the machine for job execution
            if (job.MachineId == null || job.MachineId == Guid.Empty)
            {
                _logger.LogInformation("Machine ID is null for Job ID: {JobId}, attempting to find an online machine.", job.Id);

                // Fetch machine statuses for the tenant
                var machineList = await _clientStatusStore.GetMachineStatusesAsync(job.TenantId);
                var clientDataStoreDto = machineList.FirstOrDefault(w => w.Status == MachineStatusEnum.Online);

                if (clientDataStoreDto == null)
                {
                    _logger.LogWarning("No online machine found for TenantId: {TenantId}.", job.TenantId);
                    return;
                }

                job.MachineId = clientDataStoreDto.ClientId;
            }

            // Create an ExecutionCommandDto to trigger the job execution
            var executionCommandDto = new ExecutionCommandDto
            {
                JobId = job.Id,
                Command = ExecutionCommandTypesEnum.Initiate,
                AgentId = jobDetails.FlowVersionId,
                MachineId = job.MachineId.Value,
                TenantId = job.TenantId
            };

            // Delegate the actual execution to the TriggerExecutionAsync method
            await TriggerExecutionAsync(executionCommandDto);

            // Log the successful execution trigger
            _logger.LogInformation("Job {JobId} execution successfully triggered.", job.Id);

            // Update job status in the repository
            _unitOfWork.JobRepo.Update(job);

            // Save changes asynchronously
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes for Job ID: {JobId}.", job.Id);
            }

            _logger.LogInformation("Job {JobId} executed successfully.", job.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing job {JobId}.", job?.Id);
        }
    }

    // Method to trigger the job execution on the assigned machine
    public async Task TriggerExecutionAsync(ExecutionCommandDto executionCommandDto)
    {
        try
        {
            // Retrieve the current status of the assigned machine
            var clientDataStore = await _clientStatusStore.GetClientByIdAsync(executionCommandDto.MachineId);

            if (clientDataStore == null)
            {
                // Log warning if the machine cannot be found
                _logger.LogWarning("Machine {MachineId} not found in the client status store.", executionCommandDto.MachineId);
                await _hubContext.Clients.User(clientDataStore.ConnectionId).SendAsync("error", "Assigned machine not found", _userId);
                return;
            }

            // Check machine's status before executing or resuming the job
            if ((executionCommandDto.Command == ExecutionCommandTypesEnum.Initiate || executionCommandDto.Command == ExecutionCommandTypesEnum.Resume) &&
                clientDataStore.Status != MachineStatusEnum.Online && clientDataStore.Status != MachineStatusEnum.Idle)
            {
                // Log and notify if the machine is not online or idle
                _logger.LogWarning("Machine {MachineId} is not online or idle. Job execution cannot be triggered.", executionCommandDto.MachineId);
                await _hubContext.Clients.User(clientDataStore.ConnectionId).SendAsync("error", "Assigned machine is not online or idle", _userId);
                return;
            }

            // Check if the machine is running before stopping, pausing, or cleaning up
            if ((executionCommandDto.Command == ExecutionCommandTypesEnum.Execute ||
                 executionCommandDto.Command == ExecutionCommandTypesEnum.Pause ||
                 executionCommandDto.Command == ExecutionCommandTypesEnum.Stop ||
                 executionCommandDto.Command == ExecutionCommandTypesEnum.Cancel ||
                 executionCommandDto.Command == ExecutionCommandTypesEnum.Cleanup) &&
                clientDataStore.Status != MachineStatusEnum.Running)
            {
                // Log and notify if the machine is not running when it should be
                _logger.LogWarning("Machine {MachineId} is not running. Cannot perform actions like pause, stop, cancel, or cleanup.", executionCommandDto.MachineId);
                await _hubContext.Clients.User(clientDataStore.ConnectionId).SendAsync("error", "Machine is not running", _userId);
                return;
            }

            // Log the preparation for triggering the job execution on the machine
            _logger.LogInformation("Preparing to trigger job execution on machine {MachineId} for Job {JobId}.", executionCommandDto.MachineId, executionCommandDto.JobId);

            // Update machine's last seen timestamp to ensure it's up-to-date
            clientDataStore.LastSeen = DateTimeOffset.UtcNow;
            clientDataStore.JobId = executionCommandDto.JobId;
            clientDataStore.AgentId = executionCommandDto.AgentId;

            // Update machine status based on the execution command
            switch (executionCommandDto.Command)
            {
                case ExecutionCommandTypesEnum.Initiate:
                case ExecutionCommandTypesEnum.Execute:
                case ExecutionCommandTypesEnum.Resume:
                    clientDataStore.Status = MachineStatusEnum.Running;
                    break;

                case ExecutionCommandTypesEnum.Pause:
                    clientDataStore.Status = MachineStatusEnum.Stopped;
                    break;

                case ExecutionCommandTypesEnum.Abort:
                case ExecutionCommandTypesEnum.Stop:
                case ExecutionCommandTypesEnum.Cancel:
                case ExecutionCommandTypesEnum.Cleanup:
                    clientDataStore.Status = MachineStatusEnum.Online;
                    clientDataStore.AgentId = null;
                    clientDataStore.JobId = null;
                    break;
            }

            // Persist the updated machine status
            await _clientStatusStore.UpdateClientStatusAsync(clientDataStore);

            // Send the execution command to the client machine
            await _hubContext.Clients.Client(clientDataStore.ConnectionId).SendAsync("trigger_agent", executionCommandDto);

            // Log successful execution of the job
            _logger.LogInformation("Job {JobId} successfully executed on machine {MachineId}.", executionCommandDto.JobId, executionCommandDto.MachineId);

            // Search for an active job associated with the machine if it's idle or online
            if (clientDataStore.Status == MachineStatusEnum.Online || clientDataStore.Status == MachineStatusEnum.Idle)
            {
                // Retrieve all FlowVersionIds associated with the current machine from the Machine_FlowVersion table
                var flowVersionIds = await _unitOfWork.Machine_FlowVersionRepo
                    .GetByConditionAsync(w => w.FlowVersionId == executionCommandDto.AgentId && w.TenantId == executionCommandDto.TenantId)
                    .Select(s => s.FlowVersionId)
                    .ToListAsync();

                var job = await _unitOfWork.JobRepo
                    .GetByConditionAsync(w =>
                        w.TenantId == executionCommandDto.TenantId &&
                        w.Status == JobStatusEnum.Created &&
                        flowVersionIds.Contains(w.FlowVersionId) &&
                        (w.MachineId == null || w.MachineId == executionCommandDto.MachineId)
                    )
                    .OrderByDescending(o => o.CreatedOn)
                    .FirstOrDefaultAsync();

                // If a job is found, assign it to the machine and update status
                if (job != null)
                {
                    // Assign job to this machine
                    job.MachineId = executionCommandDto.MachineId;
                    _unitOfWork.JobRepo.Update(job);
                    await _unitOfWork.SaveAsync();

                    // Update the machine's status to 'Running' as it is now processing the job
                    clientDataStore.AgentId = job.FlowVersionId;
                    clientDataStore.Status = MachineStatusEnum.Running;
                    await _clientStatusStore.AddOrUpdateStatusAsync(clientDataStore);

                    _logger.LogInformation("Assigned job {JobId} to machine {MachineId}.", job.Id, executionCommandDto.MachineId);

                    // Prepare the execution command with necessary job and machine details, and send it to the client machine for processing.
                    executionCommandDto.JobId = job.Id;
                    executionCommandDto.Command = ExecutionCommandTypesEnum.Initiate;
                    executionCommandDto.AgentId = job.FlowVersionId;
                    executionCommandDto.MachineId = job.MachineId.Value;

                    // Send execution command to the machine
                    await _hubContext.Clients.Client(clientDataStore.ConnectionId).SendAsync("trigger_agent", executionCommandDto);
                }
                else
                {
                    // If no job is found, update the machine's status to 'Idle' and notify tenant group
                    clientDataStore.AgentId = null;
                    clientDataStore.JobId = null;
                    clientDataStore.Status = MachineStatusEnum.Idle;
                    await _clientStatusStore.AddOrUpdateStatusAsync(clientDataStore);

                    // Notify tenant group that a machine is idle
                    await _hubContext.Clients.Group($"TENANT_{executionCommandDto.TenantId}").SendAsync("machine_status_update", "A machine is now idle.");
                    _logger.LogInformation("Machine {MachineId} is now idle. Notified tenant group {TenantId}.", executionCommandDto.MachineId, executionCommandDto.TenantId);
                }
            }
            else
            {
                // Notify tenant group that a machine is idle
                await _hubContext.Clients.Group($"TENANT_{executionCommandDto.TenantId}").SendAsync("machine_status_update", "A machine is now busy.");
                _logger.LogInformation("Machine {MachineId} is now idle. Notified tenant group {TenantId}.", executionCommandDto.MachineId, executionCommandDto.TenantId);
            }
        }
        catch (Exception ex)
        {
            // Log any errors encountered during job execution
            _logger.LogError(ex, "An error occurred while executing job {JobId}.", executionCommandDto?.JobId);
        }
    }

    public async Task ExecuteCommanByIdsdAsync(List<Guid> jobIds)
    {
        try
        {
            _logger.LogInformation("Executing jobs with the following IDs: {JobIds}", string.Join(", ", jobIds));

            // Retrieve the jobs based on the jobIds
            var jobsGroupedByTenantId = await _workspaceInternalDbContext.Jobs
                .Where(w => jobIds.Contains(w.Id))
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.FlowVersionMachines)
                .GroupBy(g => g.TenantId)
                .ToListAsync();

            // Log the number of jobs retrieved
            _logger.LogInformation("Retrieved {JobCount} job(s) with the provided job IDs.", jobsGroupedByTenantId.Count);

            if (jobsGroupedByTenantId.Count == 0)
            {
                _logger.LogWarning("No jobs found with the provided job IDs: {JobIds}.", string.Join(", ", jobIds));
                return;
            }

            // List of jobs that need to be updated
            List<Job> jobsNeedToUpdate = new List<Job>();

            // Process each tenant's jobs independently
            foreach (var tenantGroup in jobsGroupedByTenantId)
            {
                var tenantId = tenantGroup.Key;

                // Fetch machine statuses for the tenant
                var machineList = await _clientStatusStore.GetMachineStatusesAsync(tenantId);

                // Process each job within this tenant group
                foreach (var job in tenantGroup)
                {
                    // If the job doesn't have a valid MachineId, we need to find one
                    if (job.MachineId == null || job.MachineId == Guid.Empty)
                    {
                        _logger.LogInformation("Machine ID is null for Job ID: {JobId} in Tenant ID: {TenantId}, attempting to find an online machine.", job.Id, tenantId);

                        // Ensure machineFlows exists and is not empty
                        var machineFlows = job.FlowVersion?.FlowVersionMachines?.Where(w => w != null).ToList();
                        if (machineFlows == null || !machineFlows.Any())
                        {
                            _logger.LogWarning("No valid machine flows found for Job ID: {JobId} in Tenant ID: {TenantId}.", job.Id, tenantId);
                            continue;  // Skip this job and move to the next one
                        }

                        // Find the first machine from machineList that is online or idle and is in the machineFlows
                        var onlineMachine = machineList
                            .Where(w =>
                                machineFlows.Any(flow => flow.MachineId == w.ClientId) &&
                                (
                                    w.Status == MachineStatusEnum.Online ||
                                    w.Status == MachineStatusEnum.Idle)
                                )
                            .FirstOrDefault();

                        // If an online machine is found, assign it to the job and add to update list
                        if (onlineMachine != null && !jobsNeedToUpdate.Any(j => j.MachineId == onlineMachine.ClientId))
                        {
                            job.MachineId = onlineMachine.ClientId;
                            jobsNeedToUpdate.Add(job);
                            _logger.LogInformation("Assigned Machine ID: {MachineId} to Job ID: {JobId} in Tenant ID: {TenantId}.", onlineMachine.ClientId, job.Id, tenantId);
                        }
                        else
                        {
                            _logger.LogWarning("No available online machine found for Job ID: {JobId} in Tenant ID: {TenantId}.", job.Id, tenantId);
                        }
                    }
                }
            }

            if (jobsNeedToUpdate.Count == 0)
            {
                _logger.LogInformation("No jobs need to be updated for execution.");
                return;
            }

            // Process jobs that need to be updated
            foreach (var job in jobsNeedToUpdate)
            {
                // Create an ExecutionCommandDto to trigger the job execution
                var executionCommandDto = new ExecutionCommandDto
                {
                    JobId = job.Id,
                    Command = ExecutionCommandTypesEnum.Initiate,
                    AgentId = job.FlowVersionId,
                    MachineId = job.MachineId ?? Guid.Empty,
                    TenantId = job.TenantId
                };

                // Delegate the actual execution to the TriggerExecutionAsync method
                await TriggerExecutionAsync(executionCommandDto);

                // Log the successful execution trigger
                _logger.LogInformation("Job {JobId} execution successfully triggered.", job.Id);

                // Update the job
                _workspaceInternalDbContext.Update(job);

                // Save changes asynchronously
                await _workspaceInternalDbContext.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing job command.");
        }
    }

    // Sends a command to the connected machine to terminate a stuck job.
    public async Task KillStuckJobAsync(Job? job)
    {
        try
        {
            // Exit early if the job is null.
            if (job == null)
            {
                return;
            }

            // Find the machine currently executing the job.
            var clientDataStore = await _clientStatusStore.GetStatusByJobIdAsync(job.Id);

            if (clientDataStore == null)
            {
                _logger.LogWarning("No client is associated with job {JobId}.", job.Id);
                return;
            }

            // Ensure the machine is currently running the job.
            if (clientDataStore.Status != MachineStatusEnum.Running)
            {
                _logger.LogWarning(
                    "Machine {MachineId} is not in the Running state for job {JobId}. Current status: {Status}.",
                    clientDataStore.ClientId,
                    job.Id,
                    clientDataStore.Status);

                return;
            }

            // Ensure the machine is connected.
            if (string.IsNullOrWhiteSpace(clientDataStore.ConnectionId))
            {
                _logger.LogWarning(
                    "Machine {MachineId} is not connected. Unable to terminate job {JobId}.",
                    clientDataStore.ClientId,
                    job.Id);

                return;
            }

            var executionRequest = new ExecutionCommandDto
            {
                JobId = job.Id,
                AgentId = clientDataStore.AgentId ?? Guid.Empty,
                MachineId = clientDataStore.ClientId,
                TenantId = clientDataStore.TenantId,
                Command = ExecutionCommandTypesEnum.Killed
            };

            await _hubContext.Clients
                .Client(clientDataStore.ConnectionId)
                .SendAsync("trigger_agent", executionRequest);

            _logger.LogInformation(
                "Sent kill command for stuck job {JobId} to machine {MachineId}.",
                job.Id,
                clientDataStore.ClientId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while sending the kill command for job {JobId}.", job.Id);
        }
    }
}