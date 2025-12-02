namespace WorkspaceAPIs.Hubs;

/// <summary>
/// Main orchestrator hub for managing interactions between users and machines. Handles connection, disconnection, and agent execution logic.
/// </summary>
public class OrchestratorHub : Hub
{
    private readonly IClientStatusStore _clientStatusStore;
    private readonly ILogger<OrchestratorHub> _logger;
    private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;

    public OrchestratorHub(IClientStatusStore clientStatusStore, ILogger<OrchestratorHub> logger, WorkspaceInternalDbContext workspaceInternalDbContext)
    {
        _clientStatusStore = clientStatusStore;
        _logger = logger;
        _workspaceInternalDbContext = workspaceInternalDbContext;
    }

    // This method is called when a client successfully connects to the hub.
    // It registers the client, updates their status, and adds them to the appropriate groups based on their type.
    public override async Task OnConnectedAsync()
    {
        try
        {
            _logger.LogInformation("Client {ConnectionId} connected.", Context.ConnectionId);

            // Retrieve the HTTP context to access user identity and query parameters
            var httpContext = Context.GetHttpContext();
            var clientId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
            var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

            // Try to parse the client type from the query string (e.g., 'WorcMachine', 'WebBrowser')
            Enum.TryParse<ClientTypesEnum>(httpContext.Request.Query["clientType"], true, out var clientType);

            // Optionally, you can also retrieve other parameters as strings, if needed
            string? osId = httpContext.Request.Query["osId"];
            string? hostname = httpContext.Request.Query["hostname"];
            string? appVersion = httpContext.Request.Query["appVersion"];

            _logger.LogInformation("ClientType: {ClientType}, OSId: {OSId}, Hostname: {Hostname}, AppVersion: {AppVersion}", clientType, osId, hostname, appVersion);

            // Check if OSId and Hostname are provided
            if (!string.IsNullOrEmpty(osId) && !string.IsNullOrEmpty(hostname))
            {
                var machine = await _workspaceInternalDbContext.Machine
                    .Where(w =>
                        w.TenantId == tenantId &&
                        w.OSId.ToLower() == osId.ToLower() &&
                        w.Hostname.ToLower() == hostname.ToLower()
                    )
                    .SingleOrDefaultAsync();

                if (machine != null)
                {
                    clientId = machine.Id;
                    clientType = ClientTypesEnum.WorcMachine;
                    _logger.LogInformation("Machine found with OSId: {OSId}, Hostname: {Hostname}. Assigned ClientId: {ClientId}, ClientType: {ClientType}.", osId, hostname, clientId, clientType);
                }
                else
                {
                    clientType = ClientTypesEnum.WorcDesktopApp;
                    _logger.LogWarning("No machine found for OSId: {OSId}, Hostname: {Hostname}. Defaulting to client type {ClientType}.", osId, hostname, clientType);
                }
            }

            var connectionId = Context.ConnectionId;
            var clientStatusDto = new ClientStatusDto
            {
                TenantId = tenantId,
                ClientId = clientId,
                ConnectionId = connectionId,
                Type = clientType,
                Status = MachineStatusTypeEnum.Online,
                LastSeen = DateTimeOffset.UtcNow
            };

            await _clientStatusStore.AddOrUpdateStatusAsync(clientStatusDto);

            if (clientType == ClientTypesEnum.WebBrowser || clientType == ClientTypesEnum.WorcDesktopApp)
            {
                await Groups.AddToGroupAsync(connectionId, $"TENANT_{tenantId}");
                _logger.LogInformation("Client {ConnectionId} added to group TENANT_{TenantId}.", connectionId, tenantId);
            }

            if (clientType == ClientTypesEnum.WorcMachine)
            {
                await Clients.Group($"TENANT_{tenantId}").SendAsync("machine_status_update", "A machine is online now.");
                _logger.LogInformation("Machine {ClientId} is online. Notified tenant group {TenantId}.", clientId, tenantId);
            }

            _logger.LogInformation("Client {ConnectionId} connected successfully. TenantId: {TenantId}, ClientId: {ClientId}, ClientType: {ClientType}.", connectionId, tenantId, clientId, clientType);

            await base.OnConnectedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while handling client connection.");
            throw;
        }
    }

    // This method is triggered when a client disconnects from the hub.
    // It removes the client from the status store and notifies other connected clients if needed.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            // Get the connection ID of the client that just disconnected
            var connectionId = Context.ConnectionId;
            _logger.LogInformation("Client {ConnectionId} disconnected.", connectionId);

            var clientStatusDto = await _clientStatusStore.GetStatusByConnectionIdAsync(connectionId);

            if (clientStatusDto != null)
            {
                _logger.LogInformation("Client {ConnectionId} found in status store. TenantId: {TenantId}, ClientId: {ClientId}.", connectionId, clientStatusDto.TenantId, clientStatusDto.ClientId);

                // Remove the client’s status from the store
                await _clientStatusStore.RemoveClientByConnectionAsync(connectionId);

                // If the disconnected client is a machine, mark it as "Offline" and notify other clients in the same group
                if (clientStatusDto.Type == ClientTypesEnum.WorcMachine)
                {
                    await Clients.Group($"TENANT_{clientStatusDto.TenantId}").SendAsync("machine_status_update", "A machine is offline now.");
                    _logger.LogInformation("Machine {ClientId} offline. Notified tenant group {TenantId}.", clientStatusDto.ClientId, clientStatusDto.TenantId);
                }
                else
                {
                    // For non-machine clients, remove them from their respective tenant group
                    await Groups.RemoveFromGroupAsync(clientStatusDto.ConnectionId, $"TENANT_{clientStatusDto.TenantId}");
                    _logger.LogInformation("Client {ConnectionId} removed from group TENANT_{TenantId}.", clientStatusDto.ConnectionId, clientStatusDto.TenantId);
                }
            }
            // Call the base method to complete the disconnection process
            await base.OnDisconnectedAsync(exception);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while handling client disconnection.");
            throw;
        }
    }

    // Executes the agent on a specific machine. If no machine ID is provided or the provided one is invalid, it will select an online machine associated with the agent.
    // It updates the machine's status and triggers the agent execution if all conditions are satisfied.
    public async Task ExecuteAgent(Guid agentId, Guid? machineId)
    {
        try
        {
            _logger.LogInformation("Executing agent {AgentId} on machine {MachineId}.", agentId, machineId);

            // Retrieve the agent details from the database and check if it is published.
            var agent = await _workspaceInternalDbContext.FlowVersions
                .Where(w => w.Id == agentId && w.IsPublished)
                .Include(i => i.MachineFlows)
                .SingleOrDefaultAsync();

            if (agent == null)
            {
                _logger.LogWarning("Agent {AgentId} not found or not published.", agentId);
                await Clients.Caller.SendAsync("error", "Agent not found or not published.");
                return;
            }

            // Initialize the payload for triggering the agent.
            var payload = agent.ReactFlowObject;

            // If no machine ID is provided, attempt to find a suitable machine.
            ClientStatusDto? clientStatusDto = null;

            if (machineId == null || machineId == Guid.Empty)
            {
                _logger.LogInformation("No machine ID provided. Searching for an online machine...");

                // Retrieve all available machine IDs assigned to this agent
                var availableMachineIds = agent.MachineFlows?.Select(s => s.MachineId).ToList();
                // Fetch all machine statuses for the current tenant
                var machines = await _clientStatusStore.GetMachineStatusesAsync(agent.TenantId);

                // Find an online machine from the list of assigned machines first
                clientStatusDto = machines.FirstOrDefault(m =>
                    availableMachineIds.Contains(m.ClientId) && m.Status == MachineStatusTypeEnum.Online);

                // If no online machine is found from assigned machines, find the first available online machine
                if (clientStatusDto == null)
                {
                    clientStatusDto = machines.FirstOrDefault(m => m.Status == MachineStatusTypeEnum.Online);
                }
                // If no valid machine is found, send an error message to the client.
                if (clientStatusDto == null)
                {
                    _logger.LogWarning("No available online machine found for agent {AgentId}.", agentId);
                    await Clients.Caller.SendAsync("error", "No available online machine found.");
                    return;
                }

                // Update machineId with the found machine
                machineId = clientStatusDto.ClientId;
                _logger.LogInformation("Assigned machine {MachineId} to agent {AgentId}.", machineId, agentId);
            }

            // Retrieve the current status of the selected machine.
            if (machineId != null)
            {
                clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machineId.Value);

                // If the machine cannot be found, return an error.
                if (clientStatusDto == null)
                {
                    _logger.LogWarning("Machine {MachineId} not found.", machineId);
                    await Clients.Caller.SendAsync("error", "Machine not found.");
                    return;
                }

                // If the machine is not online, return an error indicating it's unavailable.
                if (clientStatusDto.Status != MachineStatusTypeEnum.Online)
                {
                    _logger.LogWarning("Machine {MachineId} is not online or unavailable.", machineId);
                    await Clients.Caller.SendAsync("error", "Machine is not online or unavailable.");
                    return;
                }

                // If the machine is not currently running an agent, attempt to execute the agent.
                if (clientStatusDto.Status != MachineStatusTypeEnum.Running)
                {
                    // Update the machine's status to "Running" to indicate that the agent execution is in progress.
                    clientStatusDto.Status = MachineStatusTypeEnum.Running;
                    clientStatusDto.LastSeen = DateTimeOffset.UtcNow;
                    clientStatusDto.AgentId = agentId;

                    // Persist the updated machine status to the store.
                    await _clientStatusStore.UpdateClientStatusAsync(clientStatusDto);

                    // Trigger the agent execution on the machine.
                    if (!string.IsNullOrEmpty(clientStatusDto.ConnectionId))
                    {
                        await Clients.Client(clientStatusDto.ConnectionId).SendAsync("trigger_agent", payload);
                        _logger.LogInformation("Triggered agent {AgentId} on machine {MachineId}.", agentId, machineId);
                    }
                    else
                    {
                        _logger.LogWarning("Machine {MachineId} is not connected. Cannot trigger agent {AgentId}.", machineId, agentId);

                        // If the machine is not connected, inform the client.
                        await Clients.Caller.SendAsync("error", "Machine connection lost.");
                    }
                }
                else
                {
                    _logger.LogWarning("Machine {MachineId} is already running an agent.", machineId);

                    // If the machine is already running an agent, inform the client of the conflict.
                    await Clients.Caller.SendAsync("error", "The machine is already running an agent.");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while executing agent {AgentId}.", agentId);
            await Clients.Caller.SendAsync("error", $"An error occurred while executing the agent: {ex.Message}");
        }
    }
}