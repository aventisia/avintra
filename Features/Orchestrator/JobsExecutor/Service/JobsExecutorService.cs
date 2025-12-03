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
        // Set the user ID from the HTTP context (retrieved from the JWT or session)
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _hubContext = hubContext;
        _clientStatusStore = clientStatusStore;
    }

    // Method to execute a job command
    public async Task ExecuteJobCommandAsync(Job job)
    {
        _logger.LogInformation("Starting to fetch connection ID for user: {UserId}", _userId);

        // Get the user's connection ID from the client status store
        var clientStatusList = await _clientStatusStore.GetUserStatusesAsync(job.TenantId);

        // Log the number of client statuses retrieved
        _logger.LogInformation("Retrieved {ClientStatusCount} client statuses for tenant: {TenantId}", clientStatusList.Count(), job.TenantId);

        var clientStatusDto = clientStatusList.FirstOrDefault(w => w.ClientId == _userId);

        if (clientStatusDto == null)
        {
            // Log when the client status is not found
            _logger.LogWarning("Client status not found for user with ID: {UserId}", _userId);
            return;
        }
        var userConnectionId = clientStatusDto.ConnectionId;

        // If the user's connection ID is empty or not found, exit early
        if (string.IsNullOrEmpty(userConnectionId))
        {
            _logger.LogWarning("User {UserId} connection ID is not found. Unable to send job status.", _userId);
            return;
        }

        try
        {
            // Validate the job object
            if (job == null || job.Id == Guid.Empty)
            {
                _logger.LogWarning("Invalid job received. Job is null or has an invalid Id.");
                await _hubContext.Clients.User(userConnectionId).SendAsync("ReceiveJobStatus", "Invalid job data", _userId);
                return;
            }

            // Retrieve job details from the database (with associated FlowVersion)
            var jobDetails = await _unitOfWork.JobRepo
                .GetByConditionAsync(w => w.Id == job.Id)
                .Include(i => i.FlowVersion)
                .SingleOrDefaultAsync();

            // If job not found, return an error to the client
            if (jobDetails == null)
            {
                _logger.LogWarning("Job {JobId} not found in the database.", job.Id);
                await _hubContext.Clients.User(userConnectionId).SendAsync("ReceiveJobStatus", "Job not found", _userId);
                return;
            }

            // Prepare the payload for triggering the job execution (ReactFlowObject from FlowVersion)
            var payload = jobDetails.FlowVersion.ReactFlowObject;

            // Log the job and payload preparation
            _logger.LogInformation("Preparing job execution for Job ID: {JobId}, using FlowVersion ID: {FlowVersionId}", job.Id, jobDetails.FlowVersion.Id);

            var machineId = job.MachineId;

            if (job.MachineId == null || job.MachineId == Guid.Empty)
            {
                // Log that the machine ID is null and we need to fetch it
                _logger.LogInformation("MachineId is null for job ID: {JobId}. Attempting to retrieve machine statuses for tenant: {TenantId}", job.Id, job.TenantId);

                // Get the machine statuses for the tenant
                var machineList = await _clientStatusStore.GetMachineStatusesAsync(job.TenantId);

                // Log the number of machine statuses retrieved
                _logger.LogInformation("Retrieved {MachineStatusCount} machine statuses for tenant: {TenantId}", machineList.Count(), job.TenantId);

                var machineStatusDto = machineList.FirstOrDefault(w => w.Status == MachineStatusTypeEnum.Online);

                if (machineStatusDto == null)
                {
                    // Log when the client status is not found
                    _logger.LogWarning("Machine status not found for client with ID: {ClientId} in tenant: {TenantId}", machineStatusDto.ClientId, job.TenantId);
                    return;
                }
                
                job.MachineId = machineStatusDto.ClientId;
            }

            // Retrieve machine status from the client status store
            var clientStatus = await _clientStatusStore.GetClientByIdAsync(job.MachineId.Value);

            // If machine not found, return an error to the client
            if (clientStatus == null)
            {
                _logger.LogWarning("Machine {MachineId} not found in the client status store.", job.MachineId);
                await _hubContext.Clients.User(userConnectionId).SendAsync("ReceiveJobStatus", "Assigned machine not found", _userId);
                return;
            }

            // Check if the machine is online or idle, which is required to execute the job
            if (clientStatus.Status == MachineStatusTypeEnum.Online || clientStatus.Status == MachineStatusTypeEnum.Idle)
            {
                // Log the machine's current status
                _logger.LogInformation("Machine {MachineId} is {MachineStatus}. Preparing to trigger job execution.", job.MachineId, clientStatus.Status);

                // Update the machine's status to "Running" to indicate job execution is in progress
                clientStatus.Status = MachineStatusTypeEnum.Running;
                clientStatus.LastSeen = DateTimeOffset.UtcNow;
                clientStatus.AgentId = jobDetails.FlowVersionId;

                // Persist the updated machine status in the client status store
                await _clientStatusStore.UpdateClientStatusAsync(clientStatus);

                // Trigger the job execution on the assigned machine (send payload to the client machine)
                _logger.LogInformation("Triggering job execution on machine {MachineId}.", job.MachineId);
                await _hubContext.Clients.Client(clientStatus.ConnectionId).SendAsync("trigger_agent", payload);

                // Send job execution status update to the user
                await _hubContext.Clients.User(userConnectionId).SendAsync("ReceiveJobStatus", "Job execution triggered", _userId);
            }
            else
            {
                // If the machine is not online or idle, log the warning and notify the user
                _logger.LogWarning("Machine {MachineId} is not online or idle. Job execution cannot be triggered.", job.MachineId);
                await _hubContext.Clients.User(userConnectionId).SendAsync("ReceiveJobStatus", "Assigned machine is not online or idle", _userId);
            }

            _logger.LogInformation($"Job {job.Id} completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing job {JobId}.", job?.Id);
            await _hubContext.Clients.User(userConnectionId).SendAsync("ReceiveJobStatus", "Job failed", _userId);
        }
    }
}