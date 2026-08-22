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

            // Determine the machine for job execution. A machine name is already set (job was assigned
            // to a specific machine) unless the job originated from a non-machine source ("Desktop App",
            // "Agent Builder", "Web Server"), in which case we pick an online machine.
            var machineNeedsSelection = string.IsNullOrEmpty(job.ExecutedOn)
                || (!job.ExecutedOn.StartsWith("Desktop App") && !job.ExecutedOn.StartsWith("Agent Builder"));

            if (machineNeedsSelection)
            {
                _logger.LogInformation("Machine name is null for Job ID: {JobId}, attempting to find an online machine.", job.Id);

                // Fetch machine statuses for the tenant.
                // Only pick a machine that is online and has no pending (dispatched-but-not-started) job.
                var machineList = (await _clientStatusStore.GetMachineStatusesAsync(job.TenantId)).ToList();
                _logger.LogInformation("[MANUAL-JOB-DEBUG] ExecuteJobCommandAsync: tenant {TenantId} has {Count} machine(s) in store.", job.TenantId, machineList.Count);
                foreach (var m in machineList)
                {
                    _logger.LogInformation("[MANUAL-JOB-DEBUG] ExecuteJobCommandAsync:   machine name={ClientName}, type={Type}, status={Status}, jobId={JobId}, connectionId={ConnectionId}", m.ClientName ?? m.ClientId.ToString(), m.Type, m.Status, m.JobId, m.ConnectionId);
                }

                // Pick the first machine that is online AND has no live pending job. A machine carrying a
                // stale pending marker (its job no longer exists, is terminal, or was reassigned) is
                // self-healed here so it is not blocked forever.
                ClientDataStore? clientDataStoreDto = null;
                foreach (var m in machineList)
                {
                    if (m.Status != MachineStatusEnum.Online && m.Status != MachineStatusEnum.Idle)
                        continue;

                    if (await HasLivePendingJobAsync(m))
                        continue;

                    clientDataStoreDto = m;
                    break;
                }

                if (clientDataStoreDto == null)
                {
                    _logger.LogWarning("No online machine found for TenantId: {TenantId}.", job.TenantId);
                    _logger.LogWarning("[MANUAL-JOB-DEBUG] ExecuteJobCommandAsync: no eligible machine (Online + no live pending job) found for job {JobId}, tenant {TenantId}. Dispatch aborted.", job.Id, job.TenantId);
                    return;
                }

                // The job now executes on the chosen machine. Keep the internal Guid FK (MachineId) for
                // DB dispatch, and persist the machine NAME in ExecutedOn for identification across the hub.
                job.MachineId = clientDataStoreDto.ClientId;
                job.ExecutedOn = clientDataStoreDto.ClientName ?? clientDataStoreDto.ClientId.ToString();
                _logger.LogInformation("[MANUAL-JOB-DEBUG] ExecuteJobCommandAsync: picked machine {MachineName} for job {JobId} (connectionId={ConnectionId}).", job.ExecutedOn, job.Id, clientDataStoreDto.ConnectionId);
            }
            else
            {
                _logger.LogInformation("[MANUAL-JOB-DEBUG] ExecuteJobCommandAsync: job {JobId} already has machine name {MachineName} assigned.", job.Id, job.ExecutedOn);
            }

            // Create an ExecutionCommandDto to trigger the job execution
            var executionCommandDto = new ExecutionCommandDto
            {
                JobId = job.Id,
                Command = ExecutionCommandTypesEnum.Initiate,
                AgentId = jobDetails.FlowVersionId,
                MachineName = job.ExecutedOn,
                TenantId = job.TenantId
            };

            // Delegate the actual execution to the TriggerExecutionAsync method
            await TriggerExecutionAsync(executionCommandDto);

            // Update job status in the repository
            _unitOfWork.JobRepo.Update(job);

            // Save changes asynchronously
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes for Job ID: {JobId}.", job.Id);
            }
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
            // Resolve the machine by its unique NAME (hub/websocket contract) to its internal entry.
            // Dispatch internally still keys by ClientId (Guid); the name is the public identifier.
            var machineName = executionCommandDto.MachineName;
            var clientDataStore = await _clientStatusStore.GetClientByNameAsync(executionCommandDto.TenantId, machineName);

            if (clientDataStore == null)
            {
                // Log warning if the machine cannot be found
                _logger.LogWarning("Machine {MachineName} not found in the client status store.", machineName);
                _logger.LogWarning("[MANUAL-JOB-DEBUG] TriggerExecutionAsync: machine {MachineName} NOT FOUND in store for command {Command}, job {JobId}.", machineName, executionCommandDto.Command, executionCommandDto.JobId);
                await _hubContext.Clients.User(clientDataStore.ConnectionId).SendAsync("error", "Assigned machine not found", _userId);
                return;
            }

            _logger.LogInformation("[MANUAL-JOB-DEBUG] TriggerExecutionAsync: machine {MachineName} found. status={Status}, type={Type}, connectionId={ConnectionId}, jobId={JobId}.",
                machineName, clientDataStore.Status, clientDataStore.Type, clientDataStore.ConnectionId, clientDataStore.JobId);

            // The machine's internal Guid id, used for DB job reassignment comparisons (Job.MachineId FK).
            var machineClientId = clientDataStore.ClientId;

            // Check machine's status before executing or resuming the job
            if ((executionCommandDto.Command == ExecutionCommandTypesEnum.Initiate || executionCommandDto.Command == ExecutionCommandTypesEnum.Resume) &&
                clientDataStore.Status != MachineStatusEnum.Online && clientDataStore.Status != MachineStatusEnum.Idle)
            {
                // Log and notify if the machine is not online or idle
                _logger.LogWarning("Machine {MachineName} is not online or idle. Job execution cannot be triggered.", machineName);
                _logger.LogWarning("[MANUAL-JOB-DEBUG] TriggerExecutionAsync: machine {MachineName} status is {Status} (expected Online/Idle) for command {Command}, job {JobId}. Dispatch aborted.",
                    machineName, clientDataStore.Status, executionCommandDto.Command, executionCommandDto.JobId);
                await _hubContext.Clients.User(clientDataStore.ConnectionId).SendAsync("error", "Assigned machine is not online or idle", _userId);
                return;
            }

            // Guard against double-dispatch: reject a new Initiate only while the machine already has a
            // LIVE pending (dispatched-but-not-started) job. The machine stays Online/Idle until the
            // runner actually starts the job, so a non-empty JobId here means a job is already in flight.
            // A stale marker (job no longer live) is cleared so the machine is not blocked forever.
            if (executionCommandDto.Command == ExecutionCommandTypesEnum.Initiate &&
                clientDataStore.JobId.HasValue && clientDataStore.JobId.Value != Guid.Empty)
            {
                var pendingLive = await HasLivePendingJobAsync(clientDataStore);
                if (pendingLive)
                {
                    _logger.LogWarning("Machine {MachineName} already has a pending job {PendingJobId}. Cannot initiate {JobId}.", machineName, clientDataStore.JobId, executionCommandDto.JobId);
                    _logger.LogWarning("[MANUAL-JOB-DEBUG] TriggerExecutionAsync: pending-job guard hit. Machine {MachineName} already has LIVE pending job {PendingJobId}; cannot initiate {JobId}. Dispatch aborted.",
                        machineName, clientDataStore.JobId, executionCommandDto.JobId);
                    await _hubContext.Clients.User(clientDataStore.ConnectionId).SendAsync("error", "Machine already has a pending job.", _userId);
                    return;
                }

                // Stale marker: the referenced job is no longer live. Clear it so this machine can be dispatched.
                _logger.LogWarning("[MANUAL-JOB-DEBUG] TriggerExecutionAsync: machine {MachineName} pending job {PendingJobId} is STALE. Clearing marker so machine can accept job {JobId}.",
                    machineName, clientDataStore.JobId, executionCommandDto.JobId);
                clientDataStore.JobId = null;
                await _clientStatusStore.UpdateClientStatusAsync(clientDataStore);
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
                _logger.LogWarning("Machine {MachineName} is not running. Cannot perform actions like pause, stop, cancel, or cleanup.", machineName);
                await _hubContext.Clients.User(clientDataStore.ConnectionId).SendAsync("error", "Machine is not running", _userId);
                return;
            }

            // Update machine's last seen timestamp to ensure it's up-to-date
            clientDataStore.LastSeen = DateTimeOffset.UtcNow;
            clientDataStore.JobId = executionCommandDto.JobId;
            clientDataStore.AgentId = executionCommandDto.AgentId;

            // Update machine status based on the execution command.
            // NOTE: Initiate no longer flips the machine to Running. The machine stays Online/Idle with
            // the JobId acting as a pending marker until the runner actually calls StartJob, which is the
            // single source of truth for the Running transition.
            switch (executionCommandDto.Command)
            {
                case ExecutionCommandTypesEnum.Initiate:
                    break;

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

            _logger.LogInformation("[MANUAL-JOB-DEBUG] TriggerExecutionAsync: about to send trigger_agent command={Command}, job={JobId}, agent={AgentId}, machine={MachineName}, tenant={TenantId} to connectionId={ConnectionId}.",
                executionCommandDto.Command, executionCommandDto.JobId, executionCommandDto.AgentId, machineName, executionCommandDto.TenantId, clientDataStore.ConnectionId);

            // Send the execution command to the client machine
            await _hubContext.Clients.Client(clientDataStore.ConnectionId).SendAsync("trigger_agent", executionCommandDto);

            // Log successful execution of the job
            _logger.LogInformation("Job {JobId} successfully executed on machine {MachineName}.", executionCommandDto.JobId, machineName);
            _logger.LogInformation("[MANUAL-JOB-DEBUG] TriggerExecutionAsync: trigger_agent SENT to connectionId={ConnectionId} for job {JobId}.", clientDataStore.ConnectionId, executionCommandDto.JobId);

            // A machine can pull the next pending job only when it is free (no job dispatched/in-flight).
            var isMachineFree = !clientDataStore.JobId.HasValue || clientDataStore.JobId.Value == Guid.Empty;

            // Search for an active job associated with the machine if it's idle/online and not busy.
            // A machine with a pending job falls through to the busy broadcast below.
            if ((clientDataStore.Status == MachineStatusEnum.Online || clientDataStore.Status == MachineStatusEnum.Idle) && isMachineFree)
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
                        (w.MachineId == null || w.MachineId == machineClientId)
                    )
                    .OrderByDescending(o => o.CreatedOn)
                    .FirstOrDefaultAsync();

                // If a job is found, assign it to the machine and update status
                if (job != null)
                {
                    // Assign job to this machine. Keep the internal Guid FK (MachineId) for DB dispatch,
                    // and persist the machine NAME in ExecutedOn for identification across the hub.
                    job.MachineId = machineClientId;
                    job.ExecutedOn = machineName;
                    _unitOfWork.JobRepo.Update(job);
                    await _unitOfWork.SaveAsync();

                    // Mark the machine with a pending job; status flips to Running only when the runner starts it.
                    clientDataStore.AgentId = job.FlowVersionId;
                    clientDataStore.JobId = job.Id;
                    await _clientStatusStore.AddOrUpdateStatusAsync(clientDataStore);

                    // Prepare the execution command with necessary job and machine details, and send it to the client machine for processing.
                    executionCommandDto.JobId = job.Id;
                    executionCommandDto.Command = ExecutionCommandTypesEnum.Initiate;
                    executionCommandDto.AgentId = job.FlowVersionId;
                    executionCommandDto.MachineName = machineName;

                    // Send execution command to the machine
                    await _hubContext.Clients.Client(clientDataStore.ConnectionId).SendAsync("trigger_agent", executionCommandDto);
                    _logger.LogInformation("[MANUAL-JOB-DEBUG] TriggerExecutionAsync (reassign): sent trigger_agent for reassigned job {JobId} to connectionId={ConnectionId}.", job.Id, clientDataStore.ConnectionId);
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
                }
            }
            else
            {
                // Notify tenant group that a machine is idle
                await _hubContext.Clients.Group($"TENANT_{executionCommandDto.TenantId}").SendAsync("machine_status_update", "A machine is now busy.");
            }
        }
        catch (Exception ex)
        {
            // Log any errors encountered during job execution
            _logger.LogError(ex, "An error occurred while executing job {JobId}.", executionCommandDto?.JobId);
        }
    }

    /// <summary>
    /// Determines whether a machine's pending JobId still refers to a live, un-started job that is still
    /// assigned to that machine. A job is "live" while it is still in Created status. If the job no longer
    /// exists, is terminal, or was reassigned to a different machine, the pending marker is stale and the
    /// machine should be treated as free.
    /// </summary>
    private async Task<bool> HasLivePendingJobAsync(ClientDataStore machine)
    {
        if (machine == null || !machine.JobId.HasValue || machine.JobId.Value == Guid.Empty)
            return false;

        var pendingJob = await _unitOfWork.JobRepo
            .GetByConditionAsync(w => w.Id == machine.JobId.Value)
            .Select(s => new { s.Status, s.MachineId })
            .FirstOrDefaultAsync();

        // Live = still Created AND still assigned to this machine.
        return pendingJob != null &&
               pendingJob.Status == JobStatusEnum.Created &&
               (pendingJob.MachineId == machine.ClientId || pendingJob.MachineId == null);
    }

    public async Task ExecuteCommanByIdsdAsync(List<Guid> jobIds)
    {
        try
        {
            // Retrieve the jobs based on the jobIds
            var jobsGroupedByTenantId = await _workspaceInternalDbContext.Jobs
                .Where(w => jobIds.Contains(w.Id))
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.FlowVersionMachines)
                .GroupBy(g => g.TenantId)
                .ToListAsync();

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
                            job.ExecutedOn = onlineMachine.ClientName ?? onlineMachine.ClientId.ToString();
                            jobsNeedToUpdate.Add(job);
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
                    MachineName = job.ExecutedOn,
                    TenantId = job.TenantId
                };

                // Delegate the actual execution to the TriggerExecutionAsync method
                await TriggerExecutionAsync(executionCommandDto);

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
                MachineName = clientDataStore.ClientName ?? clientDataStore.ClientId.ToString(),
                TenantId = clientDataStore.TenantId,
                Command = ExecutionCommandTypesEnum.Killed
            };

            await _hubContext.Clients
                .Client(clientDataStore.ConnectionId)
                .SendAsync("trigger_agent", executionRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while sending the kill command for job {JobId}.", job.Id);
        }
    }
}