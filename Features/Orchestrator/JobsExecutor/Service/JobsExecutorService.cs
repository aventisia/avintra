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

        // Retrieve the user's status from the client status store
        var clientStatusDto = await _clientStatusStore.GetStatusByClientIdAsync(_userId);

        if (clientStatusDto == null)
        {
            _logger.LogWarning("User {UserId} status not found.", _userId);
            return;
        }

        // If the connection ID is not found, exit early
        if (string.IsNullOrEmpty(clientStatusDto.ConnectionId))
        {
            _logger.LogWarning("User {UserId} connection ID is missing.", _userId);
            return;
        }

        try
        {
            // Validate the job object
            if (job == null || job.Id == Guid.Empty)
            {
                _logger.LogWarning("Invalid job data for Job ID: {JobId}.", job?.Id);
                await _hubContext.Clients.User(clientStatusDto.ConnectionId).SendAsync("error", "Invalid job data", _userId);
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
                await _hubContext.Clients.User(clientStatusDto.ConnectionId).SendAsync("error", "Job not found", _userId);
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
                MachineId = job.MachineId.Value
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
            await _hubContext.Clients.User(clientStatusDto.ConnectionId).SendAsync("error", "Job execution failed", _userId);
        }
    }

    // Method to trigger the job execution on the assigned machine
    public async Task TriggerExecutionAsync(ExecutionCommandDto executionCommandDto)
    {
        // Retrieve the user's connection status
        var userStatus = await _clientStatusStore.GetClientByIdAsync(_userId);

        if (userStatus == null)
        {
            _logger.LogWarning("User {UserId} is not connected.", _userId);
            return;
        }

        try
        {
            // Retrieve the machine's current status
            var machineStatus = await _clientStatusStore.GetClientByIdAsync(executionCommandDto.MachineId);

            if (machineStatus == null)
            {
                _logger.LogWarning("Machine {MachineId} not found in client status store.", executionCommandDto.MachineId);
                await _hubContext.Clients.User(userStatus.ConnectionId).SendAsync("error", "Assigned machine not found", _userId);
                return;
            }

            // Check machine's status before executing or resuming the job
            if ((executionCommandDto.Command == ExecutionCommandTypesEnum.Initiate || executionCommandDto.Command == ExecutionCommandTypesEnum.Resume) &&
                machineStatus.Status != MachineStatusTypeEnum.Online && machineStatus.Status != MachineStatusTypeEnum.Idle)
            {
                _logger.LogWarning("Machine {MachineId} is not online or idle. Job execution cannot be triggered.", executionCommandDto.MachineId);
                await _hubContext.Clients.User(userStatus.ConnectionId).SendAsync("error", "Assigned machine is not online or idle", _userId);
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
                _logger.LogWarning("Machine {MachineId} is not running. Cannot pause, stop, cancel, or clean up.", executionCommandDto.MachineId);
                await _hubContext.Clients.User(userStatus.ConnectionId).SendAsync("error", "Machine is not running", _userId);
                return;
            }

            // Log preparation for job execution
            _logger.LogInformation("Preparing to trigger job execution on machine {MachineId} for Job {JobId}.", executionCommandDto.MachineId, executionCommandDto.JobId);

            // Update machine's status and last seen time
            machineStatus.LastSeen = DateTimeOffset.UtcNow;

            // Update machine status based on command
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

            // Notify user of successful job trigger
            await _hubContext.Clients.User(userStatus.ConnectionId).SendAsync("success", "Job execution triggered", _userId);

            // Log successful job execution
            _logger.LogInformation("Job {JobId} executed successfully on machine {MachineId}.", executionCommandDto.JobId, executionCommandDto.MachineId);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during job execution
            _logger.LogError(ex, "Error executing job {JobId}.", executionCommandDto?.JobId);
            if (userStatus != null)
            {
                await _hubContext.Clients.User(userStatus.ConnectionId).SendAsync("error", "Job execution failed", _userId);
            }
        }
    }
}