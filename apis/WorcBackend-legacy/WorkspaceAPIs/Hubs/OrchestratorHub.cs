namespace WorkspaceAPIs.Hubs;

// Main orchestrator hub for managing interactions between users and machines. 
// Handles connection, disconnection, and agent execution logic.
// All clients (web browser, Tauri desktop webview, AvintraRunnerService) must present a valid
// JWT before they can connect; authorization is enforced at the handshake by [Authorize].
[Authorize]
public class OrchestratorHub : Hub
{
    private readonly IClientStatusStore _clientStatusStore;
    private readonly ILogger<OrchestratorHub> _logger;
    private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IHubContext<FlowExecutionHub> _flowExecutionHubContext;
    private readonly ICreditGateService _creditGateService;

    // Constructor to initialize dependencies
    public OrchestratorHub(IClientStatusStore clientStatusStore, ILogger<OrchestratorHub> logger, WorkspaceInternalDbContext workspaceInternalDbContext, EnvironmentConfig environmentConfig, IHubContext<FlowExecutionHub> flowExecutionHubContext, ICreditGateService creditGateService)
    {
        _clientStatusStore = clientStatusStore;
        _logger = logger;
        _workspaceInternalDbContext = workspaceInternalDbContext;
        _environmentConfig = environmentConfig;
        _flowExecutionHubContext = flowExecutionHubContext;
        _creditGateService = creditGateService;
    }

    // Invoked when a client successfully connects to the hub.
    // Registers the client, updates their status, and adds them to the appropriate groups based on their type.
    public override async Task OnConnectedAsync()
    {
        try
        {
            // Retrieve the HTTP context to access user identity and query parameters
            var httpContext = Context.GetHttpContext();

            // Extract user and tenant information from the claims (Identity)
            var userId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
            var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

            // The client type is derived authoritatively below (machine vs user), not trusted from
            // the query string. The query 'clientType' only distinguishes WebBrowser vs
            // AvintraDesktopApp for user connections (Tauri is a cookie-authed webview), and can
            // never escalate a user to a machine.
            Enum.TryParse<ClientTypesEnum>(httpContext.Request.Query["clientType"], true, out var requestedClientType);

            // Retrieve additional query parameters (OSId, Username, AppVersion, machineName)
            string? osId = httpContext.Request.Query["osId"];
            string? username = httpContext.Request.Query["username"];
            string? appVersion = httpContext.Request.Query["appVersion"];
            string? sentMachineName = httpContext.Request.Query["machineName"];

            // Initialize clientId with userId by default
            Guid clientId = userId;
            var clientType = requestedClientType == ClientTypesEnum.WebBrowser
                ? ClientTypesEnum.WebBrowser
                : ClientTypesEnum.AvintraDesktopApp;

            // The machine identity is derived from a DB lookup (tenant + osId + username), which is
            // authoritative and cannot be forged through a 'clientType' query parameter alone.
            string? clientName = null;
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

                // If a machine is found, assign it to the client and set the machine client type.
                // The DB record is authoritative for both identity and the machine name.
                if (machine != null)
                {
                    clientId = machine.Id;
                    clientType = ClientTypesEnum.AvintraMachine;
                    clientName = machine.Name;

                    // The runner may send the constructed machine name. Validate it against the DB
                    // value; never trust a client-supplied name for identity.
                    if (!string.IsNullOrEmpty(sentMachineName)
                        && !string.Equals(sentMachineName.Trim(), machine.Name, StringComparison.OrdinalIgnoreCase))
                    {
                        _logger.LogWarning(
                            "Machine name mismatch for OSId: {OSId}, Username: {Username}. Sent '{SentName}' but DB name is '{DbName}'. Using DB name.",
                            osId, username, sentMachineName, machine.Name);
                    }
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
                ClientName = clientName,
                Type = clientType,
                Status = MachineStatusEnum.Online,
                LastSeen = DateTimeOffset.UtcNow
            };

            // Update or add the status for this new client type
            await _clientStatusStore.AddOrUpdateStatusAsync(clientDataStore);

            // Add client to group based on their type (WebBrowser or DesktopApp)
            await Groups.AddToGroupAsync(connectionId, $"TENANT_{tenantId}");

            // Broadcast a structured connect event to the other clients in the same tenant. The
            // connecting client learns the current online set via GetPresenceAsync instead.
            await Clients.OthersInGroup($"TENANT_{tenantId}").SendAsync("client_presence_changed", new
            {
                clientId,
                clientName = clientName ?? clientId.ToString(),
                clientType = clientType.ToString(),
                status = MachineStatusEnum.Online.ToString(),
                tenantId,
                timestamp = DateTimeOffset.UtcNow
            });

            // Credit gate: only a machine pulls a pending job on connect, and only when its tenant
            // can afford execution. Non-machine (browser/desktop) connections never reach this check.
            var canPullPendingJob = clientType != ClientTypesEnum.AvintraMachine
                || await _creditGateService.HasSufficientCreditsAsync(tenantId);

            if (!canPullPendingJob)
                _logger.LogWarning("Blocking pending job dispatch for tenant {TenantId}: insufficient credits.", tenantId);

            // If the client is a machine, handle machine-specific logic (e.g., job assignment)
            if (clientType == ClientTypesEnum.AvintraMachine && !_environmentConfig.OnPremExecutionDisabled && canPullPendingJob)
            {
                // Retrieve all FlowVersionIds associated with the current machine from the Machine_FlowVersion table
                var flowVersionIds = await _workspaceInternalDbContext.MachineFlowVersions
                    .Where(w => w.MachineId == clientId && w.TenantId == tenantId)
                    .Select(s => s.FlowVersionId)
                    .ToListAsync();

                var job = await _workspaceInternalDbContext.Jobs
                    .Where(w =>
                        w.TenantId == tenantId &&
                        w.Status == JobStatusEnum.Created &&
                        flowVersionIds.Contains(w.FlowVersionId) &&
                        (w.MachineId == clientId || (w.MachineId == null && w.ExecutedOn == "Web Server"))
                    )
                    .OrderBy(o => o.CreatedOn)
                    .FirstOrDefaultAsync();

                // If a job is found, assign it to the machine and update the status
                if (job != null)
                {
                    // Assign job to this machine
                    job.MachineId = clientId;
                    job.ExecutedOn = clientName ?? clientId.ToString();
                    _workspaceInternalDbContext.Jobs.Update(job);
                    await _workspaceInternalDbContext.SaveChangesAsync();

                    // Keep the machine Online/Idle and record the job as a pending marker. The machine
                    // flips to Running only when the runner actually starts the job via StartJob.
                    clientDataStore.AgentId = job.FlowVersionId;
                    clientDataStore.JobId = job.Id;
                    await _clientStatusStore.AddOrUpdateStatusAsync(clientDataStore);

                    var executionRequest = new ExecutionCommandDto()
                    {
                        JobId = job.Id,
                        Command = ExecutionCommandTypesEnum.Initiate,
                        AgentId = job.FlowVersionId,
                        MachineName = clientName ?? clientDataStore.ClientId.ToString(),
                        TenantId = tenantId
                    };

                    await Clients.Caller.SendAsync("trigger_agent", executionRequest);
                }
                else
                {
                    // Notify the tenant group that a machine is online
                    await Clients.Group($"TENANT_{tenantId}").SendAsync("machine_status_update", "A machine is online now.");
                }
            }

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
                // Remove the connection from the store. The client's presence entry is only removed
                // once its last connection is gone (e.g. multiple browser tabs share one ClientId).
                await _clientStatusStore.RemoveClientByConnectionAsync(connectionId);

                // Remove the connection from its tenant group
                await Groups.RemoveFromGroupAsync(clientDataStore.ConnectionId, $"TENANT_{clientDataStore.TenantId}");

                // Broadcast Offline only when this was the last connection for the client. This
                // notifies the tenant so the UI can refresh without a page reload.
                var stillConnected = await _clientStatusStore.GetClientByIdAsync(clientDataStore.ClientId)
                    ?? await _clientStatusStore.GetStatusByClientIdAsync(clientDataStore.ClientId);

                if (stillConnected == null)
                {
                    await Clients.Group($"TENANT_{clientDataStore.TenantId}").SendAsync("client_presence_changed", new
                    {
                        clientId = clientDataStore.ClientId,
                        clientName = clientDataStore.ClientName ?? clientDataStore.ClientId.ToString(),
                        clientType = clientDataStore.Type.ToString(),
                        status = MachineStatusEnum.Offline.ToString(),
                        tenantId = clientDataStore.TenantId,
                        timestamp = DateTimeOffset.UtcNow
                    });

                    // Legacy machine-status alias so the existing workspace UI keeps working.
                    if (clientDataStore.Type == ClientTypesEnum.AvintraMachine)
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

    // Returns a snapshot of the currently online clients within the caller's tenant. A newly
    // connected client calls this right after connecting to learn who is already online, since it
    // does not receive its own connect event.
    public async Task GetPresenceAsync()
    {
        var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        var presence = await _clientStatusStore.GetPresenceAsync(tenantId);

        var payload = presence.Select(p => new
        {
            clientId = p.ClientId,
            clientName = p.ClientName ?? p.ClientId.ToString(),
            clientType = p.Type.ToString(),
            status = p.Status.ToString(),
            tenantId = p.TenantId,
            timestamp = p.LastSeen
        });

        await Clients.Caller.SendAsync("client_presence", payload);
    }

    // Executes the agent on a specified machine. If no machine name is provided or if it's invalid,
    // it attempts to find an available machine associated with the agent.
    // The method updates the machine's status and triggers the agent execution if all conditions are satisfied.
    // The machine is identified by its unique NAME (hub/websocket contract); it is resolved to the
    // internal machine entry for dispatch.
    public async Task ExecuteAgent(Guid agentId, string? machineName)
    {
        try
        {
            // Check if execution is disabled in the current environment.
            if (_environmentConfig.OnPremExecutionDisabled)
            {
                _logger.LogError("Execution is currently disabled in this environment. Job processing cannot be performed.");
                return;
            }
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

            var mappedMachineIds = (agent.FlowVersionMachines?.Select(s => s.MachineId) ?? Enumerable.Empty<Guid>()).ToHashSet();

            if (string.IsNullOrEmpty(machineName))
            {
                var availableMachines = (await _clientStatusStore.GetMachineStatusesAsync(agent.TenantId))
                    .Where(m => m.Status == MachineStatusEnum.Online || m.Status == MachineStatusEnum.Idle)
                    .ToList();

                var pendingMachineIds = new HashSet<Guid>();
                foreach (var machine in availableMachines)
                {
                    if (await _workspaceInternalDbContext.Jobs.HasLivePendingJobAsync(machine))
                        pendingMachineIds.Add(machine.ClientId);
                }

                clientDataStore = JobsAssignmentHelpers.SelectDeterministicTargetMachine(mappedMachineIds, availableMachines, pendingMachineIds);

                // If no valid machine is found, return an error message
                if (clientDataStore == null)
                {
                    _logger.LogWarning("No available machine found for agent {AgentId}.", agentId);
                    await Clients.Caller.SendAsync("error", "No available machine found.");
                    return;
                }

                // Resolve the machine name from the chosen machine for identification.
                machineName = clientDataStore.ClientName;
            }
            else
            {
                // Resolve the machine identified by name to its internal store entry.
                clientDataStore = await _clientStatusStore.GetClientByNameAsync(agent.TenantId, machineName);
                if (clientDataStore == null)
                {
                    _logger.LogWarning("Machine {MachineName} not found in client status store.", machineName);
                    await Clients.Caller.SendAsync("error", "Machine not found.");
                    return;
                }

                if (!mappedMachineIds.Contains(clientDataStore.ClientId))
                {
                    _logger.LogWarning("Machine {MachineName} is not mapped to agent {AgentId}.", machineName, agentId);
                    await Clients.Caller.SendAsync("error", "Machine is not assigned to this agent.");
                    return;
                }
            }

            // A machine can only start a new run while it is online or idle.
            if (clientDataStore.Status != MachineStatusEnum.Online && clientDataStore.Status != MachineStatusEnum.Idle)
            {
                _logger.LogWarning("Machine {MachineName} is not online or idle.", machineName);
                await Clients.Caller.SendAsync("error", "Machine is not online or idle.");
                return;
            }

            var jobId = Guid.NewGuid();

            // Retrieve user identity and tenant ID from the HTTP context
            var clientId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
            var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

            // Credit gate: block manual execution for a tenant that cannot afford it before a
            // Runner is instructed to start.
            if (!await _creditGateService.HasSufficientCreditsAsync(tenantId))
            {
                _logger.LogWarning("Blocking agent execution for tenant {TenantId}: insufficient credits.", tenantId);
                await Clients.Caller.SendAsync("error", "Insufficient credits to execute this agent.");
                return;
            }

            // Create a new job for agent execution
            var job = new Job()
            {
                Id = jobId,
                FlowVersionId = agent.Id,
                MachineId = clientDataStore.ClientId,
                ExecutedOn = clientDataStore.ClientName ?? machineName,
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

            _workspaceInternalDbContext.Jobs.Add(job);
            await _workspaceInternalDbContext.SaveChangesAsync();

            // Reserve the machine before dispatch so a concurrent selection sees the pending job.
            MachineReservationHelpers.Reserve(clientDataStore, job.Id, agentId);
            await _clientStatusStore.UpdateClientStatusAsync(clientDataStore);

            // Trigger the agent execution on the assigned machine
            if (!string.IsNullOrEmpty(clientDataStore.ConnectionId))
            {
                var executionRequest = new ExecutionCommandDto()
                {
                    JobId = job.Id,
                    Command = ExecutionCommandTypesEnum.Initiate,
                    AgentId = job.FlowVersionId,
                    MachineName = clientDataStore.ClientName ?? machineName,
                    TenantId = tenantId,
                };

                await Clients.Client(clientDataStore.ConnectionId).SendAsync("trigger_agent", executionRequest);
            }
            else
            {
                await ClearMachineReservationAsync(clientDataStore);
                _logger.LogWarning("Machine {MachineName} is not connected. Cannot trigger agent {AgentId}.", machineName, agentId);
                await Clients.Caller.SendAsync("error", "Machine connection lost.");
            }
        }
        catch (Exception ex)
        {
            // Log any errors and send an error message to the client
            _logger.LogError(ex, "An error occurred while executing agent {AgentId}.", agentId);
            await Clients.Caller.SendAsync("error", $"An error occurred while executing the agent: {ex.Message}");
        }
    }

    // Releases a machine reservation taken before dispatch when the run cannot proceed.
    private async Task ClearMachineReservationAsync(ClientDataStore machine)
    {
        MachineReservationHelpers.Release(machine);
        await _clientStatusStore.UpdateClientStatusAsync(machine);
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
