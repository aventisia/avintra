namespace WorkspaceAPIs.Services;

public class JobsExecutorService : IJobsExecutorService
{
    private readonly ILogger<IJobsExecutorService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;
    private readonly IHubContext<OrchestratorHub> _hubContext;
    private readonly IClientStatusStore _clientStatusStore;
    private readonly ICreditGateService _creditGateService;
    private readonly ICloudJobExecutionService _cloudJobExecutionService;

    private readonly Guid _userId;

    // Constructor
    public JobsExecutorService(
        ILogger<JobsExecutorService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IHubContext<OrchestratorHub> hubContext,
        IClientStatusStore clientStatusStore,
        WorkspaceInternalDbContext workspaceInternalDbContext,
        ICreditGateService creditGateService,
        ICloudJobExecutionService cloudJobExecutionService)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _hubContext = hubContext;
        _clientStatusStore = clientStatusStore;
        _workspaceInternalDbContext = workspaceInternalDbContext;
        _creditGateService = creditGateService;
        _cloudJobExecutionService = cloudJobExecutionService;
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

            if (!await _creditGateService.HasSufficientCreditsAsync(jobDetails.TenantId))
            {
                if (await CancelJobForInsufficientCreditsAsync(jobDetails.Id) == 0)
                    _logger.LogWarning("Job {JobId} was not canceled for insufficient credits; it is no longer in the Created state.", jobDetails.Id);

                _logger.LogWarning("Blocking job dispatch for tenant {TenantId}: insufficient credits.", jobDetails.TenantId);
                return;
            }

            if (JobsAssignmentHelpers.IsCloudExecutionLocation(jobDetails.ExecutedOn)
                || JobsAssignmentHelpers.IsAgentBuilderLocation(jobDetails.ExecutedOn))
            {
                await _cloudJobExecutionService.ExecuteAsync(jobDetails);
                return;
            }

            var isDesktopAppOrigin = JobsAssignmentHelpers.IsDesktopAppLocation(jobDetails.ExecutedOn);

            if (!isDesktopAppOrigin && (jobDetails.MachineId == null || jobDetails.MachineId == Guid.Empty))
            {
                var machineList = (await _clientStatusStore.GetMachineStatusesAsync(jobDetails.TenantId)).ToList();

                var mappedMachineIds = await _unitOfWork.Machine_FlowVersionRepo
                    .GetByConditionAsync(w => w.FlowVersionId == jobDetails.FlowVersionId && w.TenantId == jobDetails.TenantId)
                    .Select(s => s.MachineId)
                    .ToListAsync();

                var pendingMachineIds = new HashSet<Guid>();
                foreach (var machine in machineList)
                {
                    if (await _workspaceInternalDbContext.Jobs.HasLivePendingJobAsync(machine))
                        pendingMachineIds.Add(machine.ClientId);
                }

                var targetMachine = JobsAssignmentHelpers.SelectDeterministicTargetMachine(mappedMachineIds, machineList, pendingMachineIds);

                if (targetMachine == null)
                {
                    _logger.LogWarning("No available machine mapped to flow version {FlowVersionId} for job {JobId}, tenant {TenantId}. Job stays unassigned.", jobDetails.FlowVersionId, jobDetails.Id, jobDetails.TenantId);
                    return;
                }

                jobDetails.MachineId = targetMachine.ClientId;
                jobDetails.ExecutedOn = targetMachine.ClientName ?? targetMachine.ClientId.ToString();

                _logger.LogInformation("Job {JobId} assigned to machine {MachineName}.", jobDetails.Id, jobDetails.ExecutedOn);
            }
            else if (!isDesktopAppOrigin)
            {
                var boundMachine = await _clientStatusStore.GetClientByIdAsync(jobDetails.MachineId!.Value);
                if (boundMachine?.ClientName is string boundMachineName && !string.IsNullOrWhiteSpace(boundMachineName))
                    jobDetails.ExecutedOn = boundMachineName;
                else
                    _logger.LogInformation("Job {JobId} is bound to machine {MachineId}.", jobDetails.Id, jobDetails.MachineId);
            }

            // Create an ExecutionCommandDto to trigger the job execution
            var executionCommandDto = new ExecutionCommandDto
            {
                JobId = jobDetails.Id,
                Command = ExecutionCommandTypesEnum.Initiate,
                AgentId = jobDetails.FlowVersionId,
                MachineName = jobDetails.ExecutedOn,
                TenantId = jobDetails.TenantId
            };

            var assignedMachineId = jobDetails.MachineId;

            // Delegate the actual execution to the TriggerExecutionAsync method
            var delivered = await TriggerExecutionAsync(executionCommandDto);

            if (!delivered)
            {
                if (assignedMachineId.HasValue && assignedMachineId.Value != Guid.Empty)
                {
                    var unassigned = await UnassignJobHeldByMachineAsync(jobDetails.Id, assignedMachineId.Value);

                    if (unassigned == 1)
                    {
                        var reservedMachine = await _clientStatusStore.GetClientByIdAsync(assignedMachineId.Value);
                        if (reservedMachine != null && PendingJobClaimHelpers.ReleaseIfHeldBy(reservedMachine, jobDetails.Id))
                            await _clientStatusStore.UpdateClientStatusAsync(reservedMachine);
                    }
                }

                _logger.LogWarning("Job {JobId} could not be delivered; it stays unassigned for retry.", jobDetails.Id);
                return;
            }

            if (await PersistManualAssignmentAsync(jobDetails.Id, assignedMachineId, jobDetails.ExecutedOn) == 0)
                _logger.LogWarning("Job {JobId} assignment could not be persisted; another dispatcher already claimed it.", jobDetails.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing job {JobId}.", job?.Id);
        }
    }

    // Method to trigger the job execution on the assigned machine
    public async Task<bool> TriggerExecutionAsync(ExecutionCommandDto executionCommandDto)
    {
        try
        {
            // Resolve the machine by its unique NAME (hub/websocket contract) to its internal entry.
            // Dispatch internally still keys by ClientId (Guid); the name is the public identifier.
            var machineName = executionCommandDto.MachineName;

            // Local Desktop App runs (initiated from Studio dev mode) handle execution on the
            // runner side without joining the backend WebSocket hub, so skip hub dispatch entirely.
            if (JobsAssignmentHelpers.IsDesktopAppLocation(machineName))
            {
                return true;
            }

            var clientDataStore = await _clientStatusStore.GetClientByNameAsync(executionCommandDto.TenantId, machineName ?? string.Empty);

            if (clientDataStore == null)
            {
                // Log warning if the machine cannot be found
                _logger.LogWarning("Machine {MachineName} not found in the client status store.", machineName);
                await _hubContext.Clients.User(_userId.ToString()).SendAsync("error", "Assigned machine not found", _userId);
                return false;
            }

            // The machine's internal Guid id, used for DB job reassignment comparisons (Job.MachineId FK).
            var machineClientId = clientDataStore.ClientId;

            // Check machine's status before executing or resuming the job
            if ((executionCommandDto.Command == ExecutionCommandTypesEnum.Initiate || executionCommandDto.Command == ExecutionCommandTypesEnum.Resume) &&
                clientDataStore.Status != MachineStatusEnum.Online && clientDataStore.Status != MachineStatusEnum.Idle)
            {
                // Log and notify if the machine is not online or idle
                _logger.LogWarning("Machine {MachineName} is not online or idle. Job execution cannot be triggered.", machineName);
                await _hubContext.Clients.Client(clientDataStore.ConnectionId).SendAsync("error", "Assigned machine is not online or idle", _userId);
                return false;
            }

            // Guard against double-dispatch: reject a new Initiate only while the machine already has a
            // LIVE pending (dispatched-but-not-started) job. The machine stays Online/Idle until the
            // runner actually starts the job, so a non-empty JobId here means a job is already in flight.
            // A stale marker (job no longer live) is cleared so the machine is not blocked forever.
            // If the pending JobId matches the requested JobId, this is an intentional chained dispatch
            // from UpdateMachineIdleStateAsync — allow it through.
            if (executionCommandDto.Command == ExecutionCommandTypesEnum.Initiate &&
                clientDataStore.JobId.HasValue && clientDataStore.JobId.Value != Guid.Empty &&
                clientDataStore.JobId.Value != executionCommandDto.JobId)
            {
                var pendingLive = await _workspaceInternalDbContext.Jobs.HasLivePendingJobAsync(clientDataStore);
                if (pendingLive)
                {
                    _logger.LogWarning("Machine {MachineName} already has a pending job {PendingJobId}. Cannot initiate {JobId}.", machineName, clientDataStore.JobId, executionCommandDto.JobId);
                    await _hubContext.Clients.Client(clientDataStore.ConnectionId).SendAsync("error", "Machine already has a pending job.", _userId);
                    return false;
                }

                // Stale marker: the referenced job is no longer live. Clear it so this machine can be dispatched.
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
                await _hubContext.Clients.Client(clientDataStore.ConnectionId).SendAsync("error", "Machine is not running", _userId);
                return false;
            }

            // Update machine status based on the execution command.
            MachineReservationHelpers.Reserve(clientDataStore, executionCommandDto.JobId, executionCommandDto.AgentId);

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

            // Send the execution command to the client machine
            await _hubContext.Clients.Client(clientDataStore.ConnectionId).SendAsync("trigger_agent", executionCommandDto);

            var delivered = true;

            // Log successful execution of the job
            _logger.LogInformation("Job {JobId} successfully executed on machine {MachineName}.", executionCommandDto.JobId, machineName);

            try
            {
                // A machine can pull the next pending job only when it is free (no job dispatched/in-flight).
                var isMachineFree = !clientDataStore.JobId.HasValue || clientDataStore.JobId.Value == Guid.Empty;

                // A machine with a pending job falls through to the busy broadcast below.
                if ((clientDataStore.Status == MachineStatusEnum.Online || clientDataStore.Status == MachineStatusEnum.Idle) && isMachineFree)
                {
                    // Retrieve all FlowVersionIds associated with the current machine from the Machine_FlowVersion table
                    var flowVersionIds = await _unitOfWork.Machine_FlowVersionRepo
                        .GetByConditionAsync(w => w.FlowVersionId == executionCommandDto.AgentId && w.TenantId == executionCommandDto.TenantId)
                        .Select(s => s.FlowVersionId)
                        .ToListAsync();

                    var chainedJob = await _unitOfWork.JobRepo
                        .GetByConditionAsync(w =>
                            w.TenantId == executionCommandDto.TenantId &&
                            w.Status == JobStatusEnum.Created &&
                            flowVersionIds.Contains(w.FlowVersionId) &&
                            w.MachineId == machineClientId
                        )
                        .OrderBy(o => o.CreatedOn)
                        .FirstOrDefaultAsync();

                    var chainedClaimed = chainedJob != null
                        && await ClaimJobForMachineAsync(chainedJob.Id, machineClientId, machineName) == 1;

                    // If a job is found and this dispatch wins the claim, bind it to the machine and update status
                    if (chainedClaimed)
                    {
                        // Mark the machine with a pending job; status flips to Running only when the runner starts it.
                        clientDataStore.AgentId = chainedJob!.FlowVersionId;
                        clientDataStore.JobId = chainedJob!.Id;
                        await _clientStatusStore.AddOrUpdateStatusAsync(clientDataStore);

                        // IMPORTANT NOTE: send a fresh command object. Mutating the already delivered command would
                        // misattribute a later failure to the job that has already been sent to the machine.
                        var chainedCommand = new ExecutionCommandDto
                        {
                            JobId = chainedJob!.Id,
                            Command = ExecutionCommandTypesEnum.Initiate,
                            AgentId = chainedJob!.FlowVersionId,
                            MachineName = machineName,
                            TenantId = executionCommandDto.TenantId
                        };

                        // Send execution command to the machine
                        await _hubContext.Clients.Client(clientDataStore.ConnectionId).SendAsync("trigger_agent", chainedCommand);
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
                // IMPORTANT NOTE: the command is already on the wire (delivered). Post-dispatch notifications are
                // best effort and must never flip the delivery result, otherwise callers unassign a job that is
                // already in flight.
                _logger.LogError(ex, "Post-dispatch notification failed for job {JobId}.", executionCommandDto.JobId);
            }

            return delivered;
        }
        catch (Exception ex)
        {
            // Log any errors encountered during job execution
            _logger.LogError(ex, "An error occurred while executing job {JobId}.", executionCommandDto?.JobId);
            return false;
        }
    }

    public async Task ExecuteCommandByIdsAsync(List<Guid> jobIds)
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

            // Process each tenant's jobs independently
            foreach (var tenantGroup in jobsGroupedByTenantId)
            {
                var tenantId = tenantGroup.Key;

                // Credit gate: never dispatch a tenant's scheduled jobs when it cannot afford
                // execution. This path is used by the time-trigger scheduler, which does not go
                // through ExecuteJobCommandAsync, so the check must happen here as well.
                if (!await _creditGateService.HasSufficientCreditsAsync(tenantId))
                {
                    foreach (var job in tenantGroup)
                    {
                        _creditGateService.CancelForInsufficientCredits(job);
                        _workspaceInternalDbContext.Jobs.Update(job);
                    }

                    await _workspaceInternalDbContext.SaveChangesAsync();

                    _logger.LogWarning("Blocking scheduled job dispatch for tenant {TenantId}: insufficient credits.", tenantId);
                    continue;
                }

                // Fetch machine statuses for the tenant
                var machineList = (await _clientStatusStore.GetMachineStatusesAsync(tenantId)).ToList();

                // Process each job within this tenant group
                foreach (var job in tenantGroup)
                {
                    if (!PendingJobClaimHelpers.IsUnassignedMachineId(job.MachineId))
                        continue;

                    var machineFlows = job.FlowVersion?.FlowVersionMachines?.Where(w => w != null).ToList();
                    if (machineFlows == null || !machineFlows.Any())
                    {
                        _logger.LogWarning("No valid machine flows found for Job ID: {JobId} in Tenant ID: {TenantId}.", job.Id, tenantId);
                        continue;
                    }

                    var unavailableMachineIds = new HashSet<Guid>();
                    foreach (var machine in machineList)
                    {
                        if (await _workspaceInternalDbContext.Jobs.HasLivePendingJobAsync(machine))
                            unavailableMachineIds.Add(machine.ClientId);
                    }

                    var targetMachine = JobsAssignmentHelpers.SelectDeterministicTargetMachine(machineFlows.Select(f => f.MachineId), machineList, unavailableMachineIds);

                    if (targetMachine == null)
                    {
                        _logger.LogWarning("No available machine found for Job ID: {JobId} in Tenant ID: {TenantId}.", job.Id, tenantId);
                        continue;
                    }

                    var machineId = targetMachine.ClientId;
                    var machineName = targetMachine.ClientName ?? machineId.ToString();

                    // IMPORTANT NOTE: claim the job before reserving the marker or sending anything. Exactly one
                    // dispatcher observes one affected row; every other dispatcher must leave the job alone.
                    if (await ClaimJobForMachineAsync(job.Id, machineId, machineName) != 1)
                    {
                        _logger.LogWarning("Scheduled job {JobId} was already claimed by another dispatcher; skipping.", job.Id);
                        continue;
                    }

                    MachineReservationHelpers.Reserve(targetMachine, job.Id, job.FlowVersionId);
                    await _clientStatusStore.UpdateClientStatusAsync(targetMachine);

                    // Create an ExecutionCommandDto to trigger the job execution
                    var executionCommandDto = new ExecutionCommandDto
                    {
                        JobId = job.Id,
                        Command = ExecutionCommandTypesEnum.Initiate,
                        AgentId = job.FlowVersionId,
                        MachineName = machineName,
                        TenantId = job.TenantId
                    };

                    // Delegate the actual execution to the TriggerExecutionAsync method
                    var delivered = await TriggerExecutionAsync(executionCommandDto);

                    if (delivered)
                        continue;

                    var unassigned = await UnassignJobHeldByMachineAsync(job.Id, machineId);

                    if (unassigned == 1 && PendingJobClaimHelpers.ReleaseIfHeldBy(targetMachine, job.Id))
                        await _clientStatusStore.UpdateClientStatusAsync(targetMachine);

                    _logger.LogWarning("Scheduled job {JobId} could not be delivered; it stays unassigned for retry.", job.Id);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing job command.");
        }
    }

    private Task<int> ClaimJobForMachineAsync(Guid jobId, Guid machineId, string? machineName)
        => _workspaceInternalDbContext.Jobs
            .Where(w => w.Id == jobId
                && w.Status == JobStatusEnum.Created
                && (w.MachineId == null || w.MachineId == Guid.Empty || w.MachineId == machineId))
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(w => w.MachineId, machineId)
                .SetProperty(w => w.ExecutedOn, machineName));

    private Task<int> UnassignJobHeldByMachineAsync(Guid jobId, Guid machineId)
        => _workspaceInternalDbContext.Jobs
            .Where(w => w.Id == jobId
                && w.Status == JobStatusEnum.Created
                && w.MachineId == machineId)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(w => w.MachineId, (Guid?)null)
                .SetProperty(w => w.ExecutedOn, (string?)null)
                .SetProperty(w => w.RetryCount, w => w.RetryCount + 1));

    private Task<int> CancelJobForInsufficientCreditsAsync(Guid jobId)
    {
        var endTime = DateTimeOffset.UtcNow;

        return _workspaceInternalDbContext.Jobs
            .Where(w => w.Id == jobId
                && w.Status == JobStatusEnum.Created)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(w => w.Status, JobStatusEnum.Canceled)
                .SetProperty(w => w.EndTime, endTime)
                .SetProperty(w => w.Remark, CreditGateService.InsufficientCreditsRemark));
    }

    private Task<int> PersistManualAssignmentAsync(Guid jobId, Guid? machineId, string? executedOn)
    {
        if (PendingJobClaimHelpers.IsUnassignedMachineId(machineId))
        {
            return _workspaceInternalDbContext.Jobs
                .Where(w => w.Id == jobId
                    && w.Status == JobStatusEnum.Created)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(w => w.ExecutedOn, executedOn));
        }

        return _workspaceInternalDbContext.Jobs
            .Where(w => w.Id == jobId
                && w.Status == JobStatusEnum.Created
                && (w.MachineId == null || w.MachineId == Guid.Empty || w.MachineId == machineId))
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(w => w.MachineId, machineId)
                .SetProperty(w => w.ExecutedOn, executedOn));
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
