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

        // Try to parse the client type from the query string (e.g., 'AssistAppMachine', 'WebBrowserUser')
        Enum.TryParse<ClientTypesEnum>(httpContext.Request.Query["type"], true, out var clientType);

        // Try to parse the machine ID from the query string if available
        Guid.TryParse(httpContext.Request.Query["machineId"], out var machineId);

        // If the client type is a machine, use the machine ID as the client ID
        if (clientType == ClientTypesEnum.AssistAppMachine)
            clientId = machineId;

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

        // Handle clients that are users (e.g., WebBrowserUser, DesktopAppUser)
        if (clientType == ClientTypesEnum.WebBrowserUser || clientType == ClientTypesEnum.DesktopAppUser)
        {
            // Add the user to a tenant-specific group for group-based messaging
            await Groups.AddToGroupAsync(connectionId, $"TENANT_{tenantId}");
        }

        // Handle machine clients (e.g., AssistAppMachine)
        if (clientType == ClientTypesEnum.AssistAppMachine)
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
            if (clientStatusDto.Type == ClientTypesEnum.AssistAppMachine)
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


    // Executes an agent on a specific machine. Updates the machine's status and triggers the agent if all conditions are satisfied.
    public async Task ExecuteAgent(Guid machineId, object payload)
    {
        // Retrieve the HTTP context to access the user's identity details (e.g., clientId, tenantId).
        var httpContext = Context.GetHttpContext();
        var clientId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        // Ensure the provided machineId is valid and not an empty GUID.
        if (machineId == Guid.Empty)
        {
            await Clients.Caller.SendAsync("error", "Invalid machine ID.");
            return;
        }

        // Ensure the provided payload is not null or default.
        if (payload == null || payload == default)
        {
            await Clients.Caller.SendAsync("error", "Invalid payload.");
            return;
        }

        // Retrieve the current status of the machine using the provided machineId.
        var clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machineId);

        // If the machine cannot be found in the system, return an error.
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

        try
        {
            // Check if the machine is not currently running an agent before attempting to execute a new one.
            if (clientStatusDto.Status != MachineStatusTypeEnum.Running)
            {
                // Update the machine's status to "Running" to indicate that the agent execution is in progress.
                clientStatusDto.Status = MachineStatusTypeEnum.Running;
                clientStatusDto.LastSeen = DateTimeOffset.UtcNow;

                // Persist the updated status to the store.
                await _clientStatusStore.UpdateClientStatusAsync(clientStatusDto);

                // Send a command to trigger the agent on the machine using its connection ID.
                await Clients.Client(clientStatusDto.ConnectionId).SendAsync("trigger_agent", payload);
            }
            else
            {
                // If the machine is already running an agent, return an error indicating the conflict.
                await Clients.Caller.SendAsync("error", "The machine is already running an agent.");
            }
        }
        catch (Exception ex)
        {
            // Handle and report any unexpected exceptions that occur during agent execution.
            await Clients.Caller.SendAsync("error", $"An error occurred while executing the agent: {ex.Message}");
        }
    }
}
