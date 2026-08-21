namespace WorkspaceAPIs.Hubs;

// Main orchestrator hub for managing interactions between users and machines. 
// Handles connection, disconnection, and agent execution logic.
public class OrchestratorHub : Hub
{
    private readonly IClientStatusStore _clientStatusStore;
    private readonly ILogger<OrchestratorHub> _logger;
    private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IHubContext<FlowExecutionHub> _flowExecutionHubContext;

    // Constructor to initialize dependencies
    public OrchestratorHub(IClientStatusStore clientStatusStore, ILogger<OrchestratorHub> logger, WorkspaceInternalDbContext workspaceInternalDbContext, EnvironmentConfig environmentConfig, IHubContext<FlowExecutionHub> flowExecutionHubContext)
    {
        _clientStatusStore = clientStatusStore;
        _logger = logger;
        _workspaceInternalDbContext = workspaceInternalDbContext;
        _environmentConfig = environmentConfig;
        _flowExecutionHubContext = flowExecutionHubContext;
    }

    // Invoked when a client successfully connects to the hub.
    // Registers the client, updates their status, and adds them to the appropriate groups based on their type.
    public override async Task OnConnectedAsync()
    {
        try
        {
            // Log the connection of a client
            _logger.LogInformation("Client {ConnectionId} connected.", Context.ConnectionId);

            // Retrieve the HTTP context to access user identity and query parameters
            var httpContext = Context.GetHttpContext();

            // Extract user and tenant information from the claims (Identity)
            var userId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
            var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

            // Try to parse the client type from the query string (e.g., 'AvintraMachine', 'WebBrowser')
            Enum.TryParse<ClientTypesEnum>(httpContext.Request.Query["clientType"], true, out var clientType);

            // Retrieve additional query parameters (OSId, Username, AppVersion)
            string? osId = httpContext.Request.Query["osId"];
            string? username = httpContext.Request.Query["username"];
            string? appVersion = httpContext.Request.Query["appVersion"];

            // Log the retrieved client information
            _logger.LogInformation("ClientType: {ClientType}, OSId: {OSId}, Username: {Username}, AppVersion: {AppVersion}", clientType, osId, username, appVersion);

            // Initialize clientId with userId by default
            Guid clientId = userId;

            // If OSId and Username are provided, check if a machine exists
            if (!string.IsNullOrEmpty(osId) && !string.IsNullOrEmpty(username))
            {
                // Try to find a machine based on OSId and Username
                var machine = await _workspaceInternalDbContext.Machine
                    .Where(w =>
                        w.TenantId == tenantId &&
                        w.OsID.ToLower() == osId.ToLower() &&
                        w.Username.ToLower() == username.ToLower()
                    )
                    .SingleOrDefaultAsync();

                // If a machine is found, assign it to the client and update clientType
                if (machine != null)
                {
                    clientId = machine.Id;
                    clientType = ClientTypesEnum.AvintraMachine;
                    _logger.LogInformation("Machine found with OSId: {OSId}, Username: {Username}. Assigned ClientId: {ClientId}, ClientType: {ClientType}.", osId, username, clientId, clientType);
                }
                else
                {
                    // If no machine is found, default clientType to DesktopApp
                    clientType = ClientTypesEnum.AvintraDesktopApp;
                    _logger.LogWarning("No machine found for OSId: {OSId}, Username: {Username}. Defaulting to client type {ClientType}.", osId, username, clientType);
                }
            }

            // Check whether the client is currently executing a job.
            var existingClientDataStore = await _clientStatusStore.GetClientByIdAsync(clientId);

            if (existingClientDataStore != null && existingClientDataStore.Status == MachineStatusEnum.Running)
            {
                // Retrieve the running job associated with the client.
                var job = await _workspaceInternalDbContext.Jobs
                    .SingleOrDefaultAsync(w => w.Id == existingClientDataStore.JobId);

                // Exit if the job cannot be found.
                if (job == null)
                {
                    return;
                }

                // Mark the job as killed and set the end time if it has not already been recorded.
                job.EndTime ??= DateTimeOffset.UtcNow;
                job.Status = JobStatusEnum.Killed;
                job.Remark = "Job killed: machine reconnected while job was running.";

                _workspaceInternalDbContext.Jobs.Update(job);

                // Persist the job status update.
                await _workspaceInternalDbContext.SaveChangesAsync();
            }

            // Prepare the client status object with initial values
            var connectionId = Context.ConnectionId;
            var clientDataStore = new ClientDataStore
            {
                TenantId = tenantId,
                ClientId = clientId,
                ConnectionId = connectionId,
                Type = clientType,
                Status = MachineStatusEnum.Online,
                LastSeen = DateTimeOffset.UtcNow
            };

            // Update or add the status for this new client type
            await _clientStatusStore.AddOrUpdateStatusAsync(clientDataStore);

            // If machine, also register the desktop/user client separately
            if (clientType == ClientTypesEnum.AvintraMachine)
            {
                // Prepare the client status object with initial values
                var userClient = new ClientDataStore
                {
                    TenantId = tenantId,
                    ClientId = userId,
                    ConnectionId = connectionId,
                    Type = ClientTypesEnum.AvintraDesktopApp,
                    Status = MachineStatusEnum.Online,
                    LastSeen = DateTimeOffset.UtcNow
                };

                // Update or add the status for this new client type
                await _clientStatusStore.AddOrUpdateStatusAsync(userClient);
            }

            // Add client to group based on their type (WebBrowser or DesktopApp)
            await Groups.AddToGroupAsync(connectionId, $"TENANT_{tenantId}");
            _logger.LogInformation("Client {ConnectionId} added to group TENANT_{TenantId}.", connectionId, tenantId);

            // If the client is a machine, handle machine-specific logic (e.g., job assignment)
            if (clientType == ClientTypesEnum.AvintraMachine && !_environmentConfig.OnPremExecutionDisabled)
            {
                // Retrieve all FlowVersionIds associated with the current machine from the Machine_FlowVersion table
                var flowVersionIds = await _workspaceInternalDbContext.MachineFlowVersions
                    .Where(w => w.MachineId == clientId && w.TenantId == tenantId)
                    .Select(s => s.FlowVersionId)
                    .ToListAsync();

                // Search for an active job that is associated with the machine's FlowVersionIds
                // The job should be in 'Created' status, and either not assigned to a machine or assigned to the current machine
                var job = await _workspaceInternalDbContext.Jobs
                    .Where(w =>
                        w.TenantId == tenantId &&
                        w.Status == JobStatusEnum.Created &&
                        flowVersionIds.Contains(w.FlowVersionId) &&
                        (w.MachineId == null || w.MachineId == clientId)
                    )
                    .OrderByDescending(o => o.CreatedOn)
                    .FirstOrDefaultAsync();

                // If a job is found, assign it to the machine and update the status
                if (job != null)
                {
                    // Assign job to this machine
                    job.MachineId = clientId;
                    _workspaceInternalDbContext.Jobs.Update(job);
                    await _workspaceInternalDbContext.SaveChangesAsync();

                    // Update the machine status to 'Running' as it is now working on the job
                    clientDataStore.AgentId = job.FlowVersionId;
                    clientDataStore.JobId = job.Id;
                    clientDataStore.Status = MachineStatusEnum.Running;
                    await _clientStatusStore.AddOrUpdateStatusAsync(clientDataStore);

                    _logger.LogInformation("Assigned job {JobId} to machine {ClientId}.", job.Id, clientId);

                    var executionRequest = new ExecutionCommandDto()
                    {
                        JobId = job.Id,
                        Command = ExecutionCommandTypesEnum.Initiate,
                        AgentId = job.FlowVersionId,
                        MachineId = job.MachineId.Value,
                        TenantId = tenantId
                    };

                    await Clients.Caller.SendAsync("trigger_agent", executionRequest);
                }
                else
                {
                    // Notify the tenant group that a machine is online
                    await Clients.Group($"TENANT_{tenantId}").SendAsync("machine_status_update", "A machine is online now.");
                    _logger.LogInformation("Machine {ClientId} is online. Notified tenant group {TenantId}.", clientId, tenantId);
                }
            }

            // Final log statement indicating successful connection
            _logger.LogInformation("Client {ConnectionId} connected successfully. TenantId: {TenantId}, ClientId: {ClientId}, ClientType: {ClientType}.", connectionId, tenantId, clientId, clientType);

            // Continue with the base connection logic
            await base.OnConnectedAsync();
        }
        catch (Exception ex)
        {
            // Log any errors encountered during the connection process
            _logger.LogError(ex, "An error occurred while handling client connection.");
            throw;
        }
    }

    // Invoked when a client disconnects from the hub.
    // Removes the client's status from the store and notifies other connected clients as necessary.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            var connectionId = Context.ConnectionId;

            // Retrieve client status from the store based on the connectionId
            var clientDataStore = await _clientStatusStore.GetStatusByConnectionIdAsync(connectionId);

            // If client is found in the status store
            if (clientDataStore != null)
            {
                // Remove the client's status from the store
                await _clientStatusStore.RemoveClientByConnectionAsync(connectionId);

                // Remove non-machine clients from their tenant group
                await Groups.RemoveFromGroupAsync(clientDataStore.ConnectionId, $"TENANT_{clientDataStore.TenantId}");

                // Handle machine disconnection: if this was the last connection for that machine,
                // notify the tenant group so the UI can refresh without a page reload.
                if (clientDataStore.Type == ClientTypesEnum.AvintraMachine)
                {
                    var stillConnectedMachine = await _clientStatusStore.GetClientByIdAsync(clientDataStore.ClientId);
                    if (stillConnectedMachine == null)
                    {
                        await Clients.Group($"TENANT_{clientDataStore.TenantId}").SendAsync("machine_status_update", "A machine is offline now.");
                    }
                }
            }

            // Complete the disconnection process
            await base.OnDisconnectedAsync(exception);
        }
        catch (Exception ex)
        {
            // Log any errors encountered during the disconnection process
            _logger.LogError(ex, "An error occurred while handling client disconnection.");
            throw;
        }
    }

    // Executes the agent on a specified machine. If no machine ID is provided or if it's invalid,
    // it attempts to find an online machine associated with the agent.
    // The method updates the machine's status and triggers the agent execution if all conditions are satisfied.
    public async Task ExecuteAgent(Guid agentId, Guid? machineId)
    {
        try
        {
            // Check if execution is disabled in the current environment.
            if (_environmentConfig.OnPremExecutionDisabled)
            {
                _logger.LogError("Execution is currently disabled in this environment. Job processing cannot be performed.");
                return;
            }
            // Log the attempt to execute the agent on a machine
            _logger.LogInformation("Attempting to execute agent {AgentId} on machine {MachineId}.", agentId, machineId);

            // Retrieve agent details from the database and ensure it is published
            var agent = await _workspaceInternalDbContext.FlowVersions
                .Where(w => w.Id == agentId && w.IsPublished)
                .Include(i => i.FlowVersionMachines)
                .Include(i => i.FlowVersionHistories)
                .SingleOrDefaultAsync();

            // If the agent is not found or not published, return an error
            if (agent == null)
            {
                _logger.LogWarning("Agent {AgentId} not found or not published.", agentId);
                await Clients.Caller.SendAsync("error", "Agent not found or not published.");
                return;
            }

            // Initialize variable to hold machine status
            ClientDataStore? clientDataStore = null;

            // If no machine ID is provided, attempt to find an available online machine
            if (machineId == null || machineId == Guid.Empty)
            {
                _logger.LogInformation("No machine ID provided. Searching for an available online machine...");

                // Retrieve all machine IDs assigned to this agent
                var availableMachineIds = agent.FlowVersionMachines?.Select(s => s.MachineId).ToList();

                // Fetch all machine statuses for the current tenant
                var machines = await _clientStatusStore.GetMachineStatusesAsync(agent.TenantId);

                // Attempt to find an online machine from the list of assigned machines
                clientDataStore = machines.FirstOrDefault(m =>
                    availableMachineIds.Contains(m.ClientId) && m.Status == MachineStatusEnum.Online);

                // If no machine found in assigned list, search for any available online machine
                if (clientDataStore == null)
                {
                    clientDataStore = machines.FirstOrDefault(m => m.Status == MachineStatusEnum.Online);
                }

                // If no valid machine is found, return an error message
                if (clientDataStore == null)
                {
                    _logger.LogWarning("No available online machine found for agent {AgentId}.", agentId);
                    await Clients.Caller.SendAsync("error", "No available online machine found.");
                    return;
                }

                // Update machineId with the found machine and log the assignment
                machineId = clientDataStore.ClientId;
                _logger.LogInformation("Assigned machine {MachineId} to agent {AgentId}.", machineId, agentId);
            }

            // Retrieve user identity and tenant ID from the HTTP context
            var httpContext = Context.GetHttpContext();
            var clientId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
            var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

            // Create a new job for agent execution
            var job = new Job()
            {
                Id = Guid.NewGuid(),
                FlowVersionId = agent.Id,
                MachineId = machineId,
                RefId = clientId,
                Status = JobStatusEnum.Created,
                Priority = JobPriorityEnum.Normal,
                TenantId = tenantId,
                TriggerType = TriggerTypesEnum.Manual,
                FlowVersionHistoryId = agent.FlowVersionHistories
                    .OrderByDescending(o => o.CreatedOn)
                    .Select(s => (Guid?)s.Id)
                    .FirstOrDefault()
            };

            // Retrieve the machine status from the client status store
            clientDataStore = await _clientStatusStore.GetClientByIdAsync(machineId.Value);

            // If the machine can't be found, return an error message
            if (clientDataStore == null)
            {
                _logger.LogWarning("Machine {MachineId} not found.", machineId);
                await Clients.Caller.SendAsync("error", "Machine not found.");
                return;
            }

            // If the machine is not online, return an error
            if (clientDataStore.Status != MachineStatusEnum.Online)
            {
                _logger.LogWarning("Machine {MachineId} is not online or unavailable.", machineId);
                await Clients.Caller.SendAsync("error", "Machine is not online or unavailable.");
                return;
            }

            // If the machine is not running an agent, proceed to execute the agent
            if (clientDataStore.Status != MachineStatusEnum.Running)
            {
                // Update machine status to "Running" to indicate the agent execution is in progress
                clientDataStore.Status = MachineStatusEnum.Running;
                clientDataStore.LastSeen = DateTimeOffset.UtcNow;
                clientDataStore.AgentId = agentId;
                clientDataStore.JobId = job.Id;

                // Save the updated machine status
                await _clientStatusStore.UpdateClientStatusAsync(clientDataStore);

                // Trigger the agent execution on the assigned machine
                if (!string.IsNullOrEmpty(clientDataStore.ConnectionId))
                {
                    var executionRequest = new ExecutionCommandDto()
                    {
                        JobId = job.Id,
                        Command = ExecutionCommandTypesEnum.Initiate,
                        AgentId = job.FlowVersionId,
                        MachineId = job.MachineId.Value,
                        TenantId = tenantId,
                    };

                    await Clients.Client(clientDataStore.ConnectionId).SendAsync("trigger_agent", executionRequest);
                    _logger.LogInformation("Agent {AgentId} triggered on machine {MachineId}.", agentId, machineId);
                }
                else
                {
                    _logger.LogWarning("Machine {MachineId} is not connected. Cannot trigger agent {AgentId}.", machineId, agentId);
                    await Clients.Caller.SendAsync("error", "Machine connection lost.");
                }
            }
            else
            {
                // If the machine is already running an agent, inform the client
                _logger.LogWarning("Machine {MachineId} is already running an agent.", machineId);
                await Clients.Caller.SendAsync("error", "The machine is already running an agent.");
            }
        }
        catch (Exception ex)
        {
            // Log any errors and send an error message to the client
            _logger.LogError(ex, "An error occurred while executing agent {AgentId}.", agentId);
            await Clients.Caller.SendAsync("error", $"An error occurred while executing the agent: {ex.Message}");
        }
    }

    // Reports execution progress for a job and relays it to the user who initiated the job.
    public async Task ReportProgress(Guid jobId, string message)
    {
        try
        {
            // Look up the user associated with the job to route the notification.
            var job = await _workspaceInternalDbContext.Jobs
                .SingleOrDefaultAsync(w => w.Id == jobId);

            if (job == null)
            {
                _logger.LogWarning("Progress report received for unknown job {JobId}.", jobId);
                return;
            }

            await _flowExecutionHubContext.Clients
                .Group($"user_{job.RefId}")
                .SendAsync("JobProgress", new
                {
                    JobId = jobId,
                    Status = JobStatusEnum.Running.ToString(),
                    Message = message,
                    Timestamp = DateTimeOffset.UtcNow
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to report progress for job {JobId}.", jobId);
        }
    }

    // Reports completion for a job and relays it to the user who initiated the job.
    public async Task ReportCompletion(Guid jobId, string status, string? message = null)
    {
        try
        {
            // Look up the user associated with the job to route the notification.
            var job = await _workspaceInternalDbContext.Jobs
                .SingleOrDefaultAsync(w => w.Id == jobId);

            if (job == null)
            {
                _logger.LogWarning("Completion report received for unknown job {JobId}.", jobId);
                return;
            }

            await _flowExecutionHubContext.Clients
                .Group($"user_{job.RefId}")
                .SendAsync("JobCompleted", new
                {
                    JobId = jobId,
                    Status = status,
                    Message = message,
                    Timestamp = DateTimeOffset.UtcNow
                });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to report completion for job {JobId}.", jobId);
        }
    }

    // TODO: 
    // public async Task ExecuteAgent(ExecutionCommandDto executionCommandDto)
    // {
    //     try
    //     {
    //         // Check if execution is disabled in the current environment.
    //         if (_environmentConfig.OnPremExecutionDisabled)
    //         {
    //             _logger.LogError("Execution is currently disabled in this environment. Job processing cannot be performed.");
    //             return;
    //         }
    //         // Log the attempt to execute the agent on the specified machine
    //         _logger.LogInformation("Attempting to execute agent {AgentId} on machine {MachineId}.", executionCommandDto.AgentId, executionCommandDto.MachineId);

    //         // Initialize variable to hold machine status
    //         ClientStatusDto? clientDataStore = null;

    //         // Retrieve user identity and tenant ID from the HTTP context
    //         var httpContext = Context.GetHttpContext();
    //         var clientId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    //         var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

    //         // Fetch the machine status from the client status store
    //         clientDataStore = await _clientStatusStore.GetClientByIdAsync(executionCommandDto.MachineId);

    //         // If the machine cannot be found, return an error message
    //         if (clientDataStore == null)
    //         {
    //             _logger.LogWarning("Machine {MachineId} not found.", executionCommandDto.MachineId);
    //             await Clients.Caller.SendAsync("error", "Machine not found.");
    //             return;
    //         }

    //         // If the machine is offline or unavailable, return an error
    //         if (clientDataStore.Status != MachineStatusEnum.Online)
    //         {
    //             _logger.LogWarning("Machine {MachineId} is not online or unavailable.", executionCommandDto.MachineId);
    //             await Clients.Caller.SendAsync("error", "Machine is not online or unavailable.");
    //             return;
    //         }

    //         // If the machine is not running an agent, proceed with agent execution
    //         if (clientDataStore.Status != MachineStatusEnum.Running)
    //         {
    //             // Update machine status to "Running" to indicate the agent execution is in progress
    //             clientDataStore.Status = MachineStatusEnum.Running;
    //             clientDataStore.LastSeen = DateTimeOffset.UtcNow;
    //             clientDataStore.AgentId = executionCommandDto.AgentId;

    //             // Save the updated machine status
    //             await _clientStatusStore.UpdateClientStatusAsync(clientDataStore);

    //             // Trigger the agent execution on the assigned machine
    //             if (!string.IsNullOrEmpty(clientDataStore.ConnectionId))
    //             {
    //                 await Clients.Client(clientDataStore.ConnectionId).SendAsync("trigger_agent", executionCommandDto);
    //                 _logger.LogInformation("Agent {AgentId} triggered on machine {MachineId}.", executionCommandDto.AgentId, executionCommandDto.MachineId);
    //             }
    //             else
    //             {
    //                 _logger.LogWarning("Machine {MachineId} is not connected. Cannot trigger agent {AgentId}.", executionCommandDto.MachineId, executionCommandDto.AgentId);
    //                 await Clients.Caller.SendAsync("error", "Machine connection lost.");
    //             }
    //         }
    //         else
    //         {
    //             // If the machine is already running an agent, notify the client
    //             _logger.LogWarning("Machine {MachineId} is already running an agent.", executionCommandDto.MachineId);
    //             await Clients.Caller.SendAsync("error", "The machine is already running an agent.");
    //         }
    //     }
    //     catch (Exception ex)
    //     {
    //         // Log any exceptions and send an error message to the client
    //         _logger.LogError(ex, "An error occurred while executing agent {AgentId} on machine {MachineId}.", executionCommandDto.AgentId, executionCommandDto.MachineId);
    //         await Clients.Caller.SendAsync("error", $"An error occurred while executing the agent: {ex.Message}");
    //     }
    // }

}
