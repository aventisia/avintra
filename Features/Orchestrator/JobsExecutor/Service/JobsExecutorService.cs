namespace WorkspaceAPIs.Services;

public class JobsExecutorService : IJobsExecutorService
{
    private readonly ILogger<IJobsExecutorService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHubContext<OrchestratorHub> _hubContext;
    private readonly IClientStatusStore _clientStatusStore;

    private readonly Guid _userId;

    // Constructor
    public JobsExecutorService(
        ILogger<JobsExecutorService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IHubContext<OrchestratorHub> hubContext,
        IClientStatusStore clientStatusStore)
    {
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _hubContext = hubContext;
        _clientStatusStore = clientStatusStore;
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
                var machineStatusDto = machineList.FirstOrDefault(w => w.Status == MachineStatusTypeEnum.Online);

                if (machineStatusDto == null)
                {
                    _logger.LogWarning("No online machine found for TenantId: {TenantId}.", job.TenantId);
                    return;
                }

                job.MachineId = machineStatusDto.ClientId;
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
            var machineStatus = await _clientStatusStore.GetClientByIdAsync(executionCommandDto.MachineId);

            if (machineStatus == null)
            {
                // Log warning if the machine cannot be found
                _logger.LogWarning("Machine {MachineId} not found in the client status store.", executionCommandDto.MachineId);
                await _hubContext.Clients.User(machineStatus.ConnectionId).SendAsync("error", "Assigned machine not found", _userId);
                return;
            }

            // Check machine's status before executing or resuming the job
            if ((executionCommandDto.Command == ExecutionCommandTypesEnum.Initiate || executionCommandDto.Command == ExecutionCommandTypesEnum.Resume) &&
                machineStatus.Status != MachineStatusTypeEnum.Online && machineStatus.Status != MachineStatusTypeEnum.Idle)
            {
                // Log and notify if the machine is not online or idle
                _logger.LogWarning("Machine {MachineId} is not online or idle. Job execution cannot be triggered.", executionCommandDto.MachineId);
                await _hubContext.Clients.User(machineStatus.ConnectionId).SendAsync("error", "Assigned machine is not online or idle", _userId);
                return;
            }

            // Check if the machine is running before stopping, pausing, or cleaning up
            if ((executionCommandDto.Command == ExecutionCommandTypesEnum.Execute ||
                 executionCommandDto.Command == ExecutionCommandTypesEnum.Pause ||
                 executionCommandDto.Command == ExecutionCommandTypesEnum.Stop ||
                 executionCommandDto.Command == ExecutionCommandTypesEnum.Cancel ||
                 executionCommandDto.Command == ExecutionCommandTypesEnum.Cleanup) &&
                machineStatus.Status != MachineStatusTypeEnum.Running)
            {
                // Log and notify if the machine is not running when it should be
                _logger.LogWarning("Machine {MachineId} is not running. Cannot perform actions like pause, stop, cancel, or cleanup.", executionCommandDto.MachineId);
                await _hubContext.Clients.User(machineStatus.ConnectionId).SendAsync("error", "Machine is not running", _userId);
                return;
            }

            // Log the preparation for triggering the job execution on the machine
            _logger.LogInformation("Preparing to trigger job execution on machine {MachineId} for Job {JobId}.", executionCommandDto.MachineId, executionCommandDto.JobId);

            // Update machine's last seen timestamp to ensure it's up-to-date
            machineStatus.LastSeen = DateTimeOffset.UtcNow;

            // Update machine status based on the execution command
            switch (executionCommandDto.Command)
            {
                case ExecutionCommandTypesEnum.Initiate:
                case ExecutionCommandTypesEnum.Execute:
                case ExecutionCommandTypesEnum.Resume:
                    machineStatus.Status = MachineStatusTypeEnum.Running;
                    machineStatus.AgentId = executionCommandDto.AgentId;
                    break;

                case ExecutionCommandTypesEnum.Pause:
                    machineStatus.Status = MachineStatusTypeEnum.Stopped;
                    machineStatus.AgentId = executionCommandDto.AgentId;
                    break;

                case ExecutionCommandTypesEnum.Abort:
                case ExecutionCommandTypesEnum.Stop:
                case ExecutionCommandTypesEnum.Cancel:
                case ExecutionCommandTypesEnum.Cleanup:
                    machineStatus.Status = MachineStatusTypeEnum.Online;
                    machineStatus.AgentId = null;
                    break;
            }

            // Persist the updated machine status
            await _clientStatusStore.UpdateClientStatusAsync(machineStatus);

            // Send the execution command to the client machine
            await _hubContext.Clients.Client(machineStatus.ConnectionId).SendAsync("trigger_agent", executionCommandDto);

            // Log successful execution of the job
            _logger.LogInformation("Job {JobId} successfully executed on machine {MachineId}.", executionCommandDto.JobId, executionCommandDto.MachineId);

            // Search for an active job associated with the machine if it's idle or online
            if (machineStatus.Status == MachineStatusTypeEnum.Online || machineStatus.Status == MachineStatusTypeEnum.Idle)
            {
                var job = await _unitOfWork.JobRepo
                    .GetByConditionAsync(w =>
                        w.TenantId == executionCommandDto.TenantId &&
                        w.Status == JobStatusTypesEnum.Created &&
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
                    machineStatus.AgentId = job.FlowVersionId;
                    machineStatus.Status = MachineStatusTypeEnum.Running;
                    await _clientStatusStore.AddOrUpdateStatusAsync(machineStatus);

                    _logger.LogInformation("Assigned job {JobId} to machine {MachineId}.", job.Id, executionCommandDto.MachineId);

                    // Prepare the execution command with necessary job and machine details, and send it to the client machine for processing.
                    executionCommandDto.JobId = job.Id;
                    executionCommandDto.Command = ExecutionCommandTypesEnum.Initiate;
                    executionCommandDto.AgentId = job.FlowVersionId;
                    executionCommandDto.MachineId = job.MachineId.Value;

                    // Send execution command to the machine
                    await _hubContext.Clients.Client(machineStatus.ConnectionId).SendAsync("trigger_agent", executionCommandDto);
                }
                else
                {
                    // If no job is found, update the machine's status to 'Idle' and notify tenant group
                    machineStatus.AgentId = null;
                    machineStatus.Status = MachineStatusTypeEnum.Idle;
                    await _clientStatusStore.AddOrUpdateStatusAsync(machineStatus);

                    // Notify tenant group that a machine is idle
                    await _hubContext.Clients.Group($"TENANT_{executionCommandDto.TenantId}").SendAsync("machine_status_update", "A machine is now idle.");
                    _logger.LogInformation("Machine {MachineId} is now idle. Notified tenant group {TenantId}.", executionCommandDto.MachineId, executionCommandDto.TenantId);
                }
            }
        }
        catch (Exception ex)
        {
            // Log any errors encountered during job execution
            _logger.LogError(ex, "An error occurred while executing job {JobId}.", executionCommandDto?.JobId);
        }
    }
}