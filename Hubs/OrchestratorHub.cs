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

    // Called when a client successfully connects to the hub. Registers the client, updates status, and adds to appropriate groups.
    public override async Task OnConnectedAsync()
    {
        // Retrieve the HTTP context to access user identity and query parameters
        var httpContext = Context.GetHttpContext();

        // Retrieve the client ID and tenant ID from the user's identity
        var clientId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        // Try to parse the client type from the query string (e.g., 'AssistAppMachine', 'WebBrowserUser')
        Enum.TryParse<ClientTypesEnum>(httpContext.Request.Query["type"], true, out var clientType);

        // Try to parse the machineId from the query string if available
        Guid.TryParse(httpContext.Request.Query["machineId"], out var machineId);

        // If the client type is a machine, override the clientId with the machineId
        if (clientType == ClientTypesEnum.AssistAppMachine)
            clientId = machineId;

        // Get the unique connection ID for this client (used for real-time messaging)
        var connectionId = Context.ConnectionId;

        // Create or update the client status object to store the client's connection details
        var clientStatusDto = new ClientStatusDto
        {
            TenantId = tenantId,
            ClientId = clientId,
            ConnectionId = connectionId, 
            Type = clientType,
            Status = MachineStatusTypeEnum.Online,
            LastSeen = DateTimeOffset.UtcNow
        };

        // Store or update the client's status in the status store
        await _clientStatusStore.AddOrUpdateStatusAsync(clientStatusDto);

        // Add the client to a tenant-specific group for group-based messaging
        await Groups.AddToGroupAsync(connectionId, $"TENANT_{tenantId}");

        // Special handling for machine clients (e.g., AssistAppMachine)
        if (clientType == ClientTypesEnum.AssistAppMachine)
        {
            // Notify all users in the tenant group that a new machine has come online
            await Clients.Group($"TENANT_{tenantId}").SendAsync("machine_status_update", clientStatusDto);
        }

        // Special handling for user clients (e.g., WebBrowserUser, DesktopAppUser)
        if (clientType == ClientTypesEnum.WebBrowserUser || clientType == ClientTypesEnum.DesktopAppUser)
        {
            // Retrieve a list of all machines for the tenant and send to the connected user
            var machines = await _clientStatusStore.GetMachineStatusesAsync(tenantId);
            await Clients.Caller.SendAsync("machine_status_update", machines);
        }

        // Complete the connection process (this is an override of the base method)
        await base.OnConnectedAsync();
    }

    // Called when a client disconnects from the hub. Removes the client from the status store and notifies other clients if necessary.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Get the connection ID of the client that disconnected
        var connectionId = Context.ConnectionId;

        // Retrieve the client's status from the status store using the connection ID
        var clientStatusDto = await _clientStatusStore.GetStatusByConnectionIdAsync(connectionId);

        // If a valid client status is found, proceed with disconnection handling
        if (clientStatusDto != null)
        {
            // Remove the client from the status store
            await _clientStatusStore.RemoveClientByConnectionAsync(connectionId);

            // If the disconnected client is a machine, update its status to "Offline" and notify other clients
            if (clientStatusDto.Type == ClientTypesEnum.AssistAppMachine)
            {
                clientStatusDto.Status = MachineStatusTypeEnum.Offline;
                await Clients.Group($"TENANT_{clientStatusDto.TenantId}").SendAsync("machine_status_update", clientStatusDto);
            }
        }

        // Complete the disconnection process (this is an override of the base method)
        await base.OnDisconnectedAsync(exception);
    }

    // Executes an agent on a specific machine. Updates the machine's status and triggers the agent if all conditions are met.
    public async Task ExecuteAgent(Guid machineId, Guid agentId, bool isExecutionCompleted)
    {
        // Retrieve the HTTP context to access user identity details (e.g., clientId, tenantId)
        var httpContext = Context.GetHttpContext();
        var clientId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        // Validate machineId and agentId to ensure they are not empty GUIDs
        if (machineId == Guid.Empty || agentId == Guid.Empty)
        {
            await Clients.Caller.SendAsync("error", "Invalid machine or agent ID.");
            return;
        }

        // Retrieve the machine's current status using the machineId from the store
        var clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machineId);

        // If the machine is not found in the store, send an error message
        if (clientStatusDto == null)
        {
            await Clients.Caller.SendAsync("error", "Machine not found.");
            return;
        }

        // If the execution is marked as completed, update the machine's status to "Online"
        if (isExecutionCompleted)
        {
            // If the machine is already online, return an error since the status doesn't need to be updated
            if (clientStatusDto.Status == MachineStatusTypeEnum.Online)
            {
                await Clients.Caller.SendAsync("error", "Machine is already online.");
                return;
            }

            // Update the machine's status to "Online" and set the current timestamp
            clientStatusDto.Status = MachineStatusTypeEnum.Online;
            clientStatusDto.LastSeen = DateTimeOffset.UtcNow;

            // Store the updated machine status in the status store
            await _clientStatusStore.UpdateClientStatusAsync(clientStatusDto);

            // Notify all clients in the tenant's group about the status update of the machine
            await Clients.Group($"TENANT_{tenantId}").SendAsync("machine_status_update", clientStatusDto);
            return;
        }

        // If the machine is not online, send an error message
        if (clientStatusDto.Status != MachineStatusTypeEnum.Online)
        {
            await Clients.Caller.SendAsync("error", "Machine is not online or unavailable.");
            return;
        }

        // Retrieve the agent details from the repository to ensure it's valid and published
        var agent = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w => w.Id == agentId && w.IsPublished)
            .FirstOrDefaultAsync();

        // If the agent is not found or not published, return an error message
        if (agent == null)
        {
            await Clients.Caller.SendAsync("error", "Agent not found or not published.");
            return;
        }

        try
        {
            // Check if the machine is not already running an agent before starting a new one
            if (clientStatusDto.Status != MachineStatusTypeEnum.Running)
            {
                // Update the machine's status to "Running" to indicate the agent is being executed
                clientStatusDto.Status = MachineStatusTypeEnum.Running;
                clientStatusDto.LastSeen = DateTimeOffset.UtcNow;

                // Update the machine's status in the store
                await _clientStatusStore.UpdateClientStatusAsync(clientStatusDto);

                // Trigger the agent execution on the machine by sending a command to the machine's connection
                await Clients.Client(clientStatusDto.ConnectionId).SendAsync("trigger_agent_manual", new { agent });
            }
            else
            {
                // If the machine is already running an agent, send an error message
                await Clients.Caller.SendAsync("error", "The machine is already running an agent.");
            }
        }
        catch (Exception ex)
        {
            // Catch and report any unexpected exceptions during the execution of the agent
            await Clients.Caller.SendAsync("error", $"An error occurred while executing the agent: {ex.Message}");
        }
    }
}
