namespace WorkspaceAPIs.Hubs;

/// <summary>
/// Main orchestrator hub for managing interactions between users and machines. Handles connection, disconnection, and agent execution logic.
/// </summary>
public class OrchestratorHub : Hub
{
    private readonly IClientStatusStore _clientStatusStore;
    private readonly IUnitOfWork _unitOfWork;

    public OrchestratorHub(IClientStatusStore clientStatusStore, IUnitOfWork unitOfWork)
    {
        _clientStatusStore = clientStatusStore;
        _unitOfWork = unitOfWork;
    }

    // This method is called when a client successfully connects to the hub.
    // It registers the client, updates their status, and adds them to the appropriate groups based on their type.
    public override async Task OnConnectedAsync()
    {
        // Retrieve the HTTP context to access user identity and query parameters
        var httpContext = Context.GetHttpContext();

        // Extract the client ID and tenant ID from the user's identity claims
        var clientId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        // Try to parse the client type from the query string (e.g., 'WorcMachine', 'WebBrowser')
        Enum.TryParse<ClientTypesEnum>(httpContext.Request.Query["clientType"], true, out var clientType);

        // Optionally, you can also retrieve other parameters as strings, if needed
        string? osId = httpContext.Request.Query["osId"];
        string? hostname = httpContext.Request.Query["hostname"];
        string? appVersion = httpContext.Request.Query["appVersion"];


        // Check if both osId and hostname are provided in the query string
        if (!string.IsNullOrEmpty(osId) && !string.IsNullOrEmpty(hostname))
        {
            // Attempt to find a machine that matches the osId and hostname for the given tenant
            var machine = await _unitOfWork.MachineRepo
                .GetByConditionAsync(w =>
                    w.TenantId == tenantId &&
                    w.OSId.ToLower() == osId.ToLower() &&
                    w.Hostname.ToLower() == hostname.ToLower()
                )
                .SingleOrDefaultAsync();

            // If a machine is found, set the clientId to the machine's ID and set the clientType to WorcMachine
            if (machine != null)
            {
                clientId = machine.Id;
                clientType = ClientTypesEnum.WorcMachine;
            }
            else
            {
                // If no machine is found, default the clientType to WorcDesktopApp (i.e., desktop application)
                clientType = ClientTypesEnum.WorcDesktopApp;
            }
        }

        // Get the unique connection ID for this client (used for real-time messaging)
        var connectionId = Context.ConnectionId;

        // Create a new ClientStatusDto object to store the client's connection details
        var clientStatusDto = new ClientStatusDto
        {
            TenantId = tenantId,
            ClientId = clientId,
            ConnectionId = connectionId,
            Type = clientType,
            Status = MachineStatusTypeEnum.Online,
            LastSeen = DateTimeOffset.UtcNow
        };

        // Add or update the client's status in the status store
        await _clientStatusStore.AddOrUpdateStatusAsync(clientStatusDto);

        // Handle clients that are users (e.g., WebBrowser, DesktopAppUser)
        if (clientType == ClientTypesEnum.WebBrowser || clientType == ClientTypesEnum.WorcDesktopApp)
        {
            // Add the user to a tenant-specific group for group-based messaging
            await Groups.AddToGroupAsync(connectionId, $"TENANT_{tenantId}");
        }

        // Handle machine clients (e.g., WorcMachine)
        if (clientType == ClientTypesEnum.WorcMachine)
        {
            // Notify all users in the tenant group that a new machine has come online
            await Clients.Group($"TENANT_{tenantId}").SendAsync("machine_status_update", "A machine is online now.");
        }

        // Complete the connection process by calling the base method
        await base.OnConnectedAsync();
    }


    // This method is triggered when a client disconnects from the hub.
    // It removes the client from the status store and notifies other connected clients if needed.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Get the connection ID of the client that just disconnected
        var connectionId = Context.ConnectionId;

        // Retrieve the client's status from the status store using their connection ID
        var clientStatusDto = await _clientStatusStore.GetStatusByConnectionIdAsync(connectionId);

        // If a valid client status is found, proceed with the disconnection handling
        if (clientStatusDto != null)
        {
            // Remove the client’s status from the store
            await _clientStatusStore.RemoveClientByConnectionAsync(connectionId);

            // If the disconnected client is a machine, mark it as "Offline" and notify other clients in the same group
            if (clientStatusDto.Type == ClientTypesEnum.WorcMachine)
            {
                await Clients.Group($"TENANT_{clientStatusDto.TenantId}").SendAsync("machine_status_update", "A machine is offline now.");
            }
            else
            {
                // For non-machine clients, remove them from their respective tenant group
                await Groups.RemoveFromGroupAsync(clientStatusDto.ConnectionId, $"TENANT_{clientStatusDto.TenantId}");
            }
        }

        // Call the base method to complete the disconnection process
        await base.OnDisconnectedAsync(exception);
    }


    // Executes the agent on a specific machine. If no machine ID is provided or the provided one is invalid, it will select an online machine associated with the agent.
    // It updates the machine's status and triggers the agent execution if all conditions are satisfied.
    public async Task ExecuteAgent(Guid agentId, Guid? machineId)
    {
        try
        {
            // Retrieve the agent details from the database and check if it is published.
            var agent = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == agentId && w.IsPublished)
                .Include(i => i.MachineFlows)
                .SingleOrDefaultAsync();

            // Validate if the agent exists and is published.
            if (agent == null)
            {
                await Clients.Caller.SendAsync("error", "Agent not found or not published.");
                return;
            }

            // Initialize the payload for triggering the agent. 
            var payload = agent.ReactFlowObject;

            // If no machine ID is provided, attempt to find a suitable machine.
            ClientStatusDto? clientStatusDto = null;

            if (machineId == null || machineId == Guid.Empty)
            {
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
                    await Clients.Caller.SendAsync("error", "No available online machine found.");
                    return;
                }

                // Update machineId with the found machine
                machineId = clientStatusDto.ClientId;
            }

            // Retrieve the current status of the selected machine.
            if (machineId != null)
            {
                clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machineId.Value);

                // If the machine cannot be found, return an error.
                if (clientStatusDto == null)
                {
                    await Clients.Caller.SendAsync("error", "Machine not found.");
                    return;
                }

                // If the machine is not online, return an error indicating it's unavailable.
                if (clientStatusDto.Status != MachineStatusTypeEnum.Online)
                {
                    await Clients.Caller.SendAsync("error", "Machine is not online or unavailable.");
                    return;
                }

                // If the machine is not currently running an agent, attempt to execute the agent.
                if (clientStatusDto.Status != MachineStatusTypeEnum.Running)
                {
                    // Update the machine's status to "Running" to indicate that the agent execution is in progress.
                    clientStatusDto.Status = MachineStatusTypeEnum.Running;
                    clientStatusDto.LastSeen = DateTimeOffset.UtcNow;

                    // Persist the updated machine status to the store.
                    await _clientStatusStore.UpdateClientStatusAsync(clientStatusDto);

                    // Trigger the agent execution on the machine.
                    if (!string.IsNullOrEmpty(clientStatusDto.ConnectionId))
                    {
                        await Clients.Client(clientStatusDto.ConnectionId).SendAsync("trigger_agent", payload);
                    }
                    else
                    {
                        // If the machine is not connected, inform the client.
                        await Clients.Caller.SendAsync("error", "Machine connection lost.");
                    }
                }
                else
                {
                    // If the machine is already running an agent, inform the client of the conflict.
                    await Clients.Caller.SendAsync("error", "The machine is already running an agent.");
                }
            }
        }
        catch (Exception ex)
        {
            // Handle any unexpected exceptions and send a generic error message to the client.
            await Clients.Caller.SendAsync("error", $"An error occurred while executing the agent: {ex.Message}");
        }
    }
}