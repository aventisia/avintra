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
        // Retrieve necessary data from the connection context and query string
        var httpContext = Context.GetHttpContext();
        var clientId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        // Try to parse client type from query string
        Enum.TryParse<ClientTypesEnum>(httpContext.Request.Query["type"], true, out var clientType);

        // Try to parse machineId if it's available in the query
        Guid.TryParse(httpContext.Request.Query["machineId"], out var machineId);

        // If the client type is a machine, override the clientId with machineId
        if (clientType == ClientTypesEnum.AssistAppMachine)
            clientId = machineId;

        // Get the unique connection ID for this client
        var connectionId = Context.ConnectionId;

        // Create or update the client status in the store
        var clientStatusDto = new ClientStatusDto
        {
            TenantId = tenantId,
            ClientId = clientId,
            ConnectionId = connectionId,
            Type = clientType,
            Status = MachineStatusTypeEnum.Online,
            LastSeen = DateTimeOffset.UtcNow
        };

        // Store or update the client's status
        await _clientStatusStore.AddOrUpdateStatusAsync(clientStatusDto);

        // Add the client to a tenant-specific group for group-based messaging
        await Groups.AddToGroupAsync(connectionId, $"TENANT_{tenantId}");

        // If it's a machine, also create a group for the machine itself
        if (clientType == ClientTypesEnum.AssistAppMachine)
        {
            // Notify all users in the same tenant that a machine has come online
            await Clients.Group($"TENANT_{tenantId}").SendAsync("machine_status_update", clientStatusDto);
        }

        // If it's a user, send a snapshot of all machines to this user
        if (clientType == ClientTypesEnum.WebBrowserUser || clientType == ClientTypesEnum.DesktopAppUser)
        {
            // Retrieve the list of machines for the tenant and send them to the user
            var machines = await _clientStatusStore.GetMachineStatusesAsync(tenantId);
            await Clients.Caller.SendAsync("machine_status_update", machines);
        }

        // Complete the connection process
        await base.OnConnectedAsync();
    }

    // Called when a client disconnects from the hub. Removes the client from the status store and notifies other clients if necessary.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // Retrieve the connection ID and get the associated client status
        var connectionId = Context.ConnectionId;
        var clientStatusDto = await _clientStatusStore.GetStatusByConnectionIdAsync(connectionId);

        // If the client status is found, remove it and notify other users if needed
        if (clientStatusDto != null)
        {
            // Remove the client from the status store
            await _clientStatusStore.RemoveClientByConnectionAsync(connectionId);

            // If it's a machine that disconnected, notify all users in the same tenant
            if (clientStatusDto.Type == ClientTypesEnum.AssistAppMachine)
            {
                clientStatusDto.Status = MachineStatusTypeEnum.Offline;

                await Clients.Group($"TENANT_{clientStatusDto.TenantId}").SendAsync("machine_status_update", clientStatusDto);
            }
        }

        // Complete the disconnection process
        await base.OnDisconnectedAsync(exception);
    }

    // Executes an agent on a specific machine. Updates the machine's status and triggers the agent if all conditions are met.
    public async Task ExecuteAgent(Guid machineId, Guid agentId)
    {
        var httpContext = Context.GetHttpContext();
        var clientId = Guid.Parse(Context?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        var tenantId = Guid.Parse(Context?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        // Retrieve the status of the machine to ensure it's online
        var clientStatusDto = await _clientStatusStore.GetClientByIdAsync(machineId);

        // If the machine is not found or not online, send an error message to the caller
        if (clientStatusDto == null || clientStatusDto.Status != MachineStatusTypeEnum.Online)
        {
            await Clients.Caller.SendAsync("error", "Assist App not found or not online");
            return; // Exit if the machine is not available or not online
        }

        // Retrieve the agent details from the repository
        var agent = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(w => w.Id == agentId && w.IsPublished)
            .FirstOrDefaultAsync();

        // If the agent is not found or is not published, send an error message to the caller
        if (agent == null)
        {
            await Clients.Caller.SendAsync("error", "Agent not found or not published");
            return;
        }

        try
        {
            // Update the machine's status to "Running" as it's about to execute the agent
            clientStatusDto.Status = MachineStatusTypeEnum.Running;
            clientStatusDto.LastSeen = DateTimeOffset.UtcNow;

            // Update the machine's status in the store
            await _clientStatusStore.UpdateClientStatusAsync(clientStatusDto);

            // Notify the machine group to trigger the agent
            await Clients.Client(clientStatusDto.ConnectionId).SendAsync("trigger_agent_manual", new { agent });
        }
        catch (Exception ex)
        {
            await Clients.Caller.SendAsync("error", $"An error occurred while executing the agent: {ex.Message}");
        }
    }
}