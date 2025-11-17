namespace WorkspaceAPIs.Hubs;

[Authorize]
public class MachineHub : Hub
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MachineHub> _logger;

    public MachineHub(ILogger<MachineHub> logger, IUnitOfWork unitOfWork)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Triggered when a client successfully connects to the SignalR hub.
    public override async Task OnConnectedAsync()
    {
        try
        {
            _logger.LogInformation($"Client with Connection ID {Context.ConnectionId} has connected.");

            // Send the current status of all registered machines to the newly connected client.
            await Clients.Caller.SendAsync("MachinesStatus", MachineStore.Machines.Values);

            _logger.LogInformation("Successfully sent machine statuses to the connected client.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while handling the connection for client with Connection ID {Context.ConnectionId}.");
            throw;
        }

        await base.OnConnectedAsync();
    }

    // Triggered when a client disconnects from the SignalR hub.
    // In this case, no specific action is required for the machine status when a client disconnects.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            _logger.LogInformation($"Client with Connection ID {Context.ConnectionId} has disconnected.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while handling the disconnection for client with Connection ID {Context.ConnectionId}.");
            throw;
        }

        await base.OnDisconnectedAsync(exception);
    }

    
    // Handles heartbeat updates from machines, ensuring their status is kept as "Online".
    public async Task Heartbeat(Guid machineId)
    {
        try
        {
            _logger.LogInformation($"Received heartbeat from machine with ID: {machineId}");

            // Check if the machine exists in the in-memory store.
            if (!MachineStore.Machines.TryGetValue(machineId, out var machineStatus))
            {
                _logger.LogWarning($"Machine with ID {machineId} not found in the in-memory store.");
                return;
            }

            // Update the machine's last updated timestamp and keep its status as "Online".
            machineStatus.LastUpdated = DateTime.UtcNow;
            machineStatus.Status = MachineStatusTypeEnum.Online;

            // Save the updated status to the in-memory store.
            MachineStore.Machines[machineId] = machineStatus;

            // Notify all clients about the updated machine status.
            await Clients.All.SendAsync("MachinesStatus", MachineStore.Machines.Values);

            _logger.LogInformation($"Heartbeat received for machine with ID {machineId}. Status updated to 'Online'.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while processing the heartbeat for machine with ID: {machineId}.");
            throw;
        }
    }

    // Handles the result of a machine task execution, setting the machine's status to "Running" during execution, 
    // and then "Online" once the execution is complete.
    public async Task ExecutionResult(Guid machineId, string executionOutput)
    {
        try
        {
            _logger.LogInformation($"Execution result received for machine with ID: {machineId}. Output: {executionOutput}");

            // Check if the machine exists in the in-memory store.
            if (!MachineStore.Machines.TryGetValue(machineId, out var machineStatus))
            {
                _logger.LogWarning($"Machine with ID {machineId} not found in the in-memory store.");
                return;
            }

            // Update the machine status to "Running" while it's processing the task.
            machineStatus.Status = MachineStatusTypeEnum.Running;
            machineStatus.LastUpdated = DateTimeOffset.UtcNow;

            // Save the updated status to the in-memory store.
            MachineStore.Machines[machineId] = machineStatus;

            // Notify all clients about the updated machine status.
            await Clients.All.SendAsync("MachinesStatus", MachineStore.Machines.Values);

            _logger.LogInformation($"Machine with ID {machineId} status updated to 'Running'.");

            await Task.Delay(3000);

            // After the execution completes, set the machine status to "Online".
            machineStatus.Status = MachineStatusTypeEnum.Online;
            MachineStore.Machines[machineId] = machineStatus;

            // Notify clients about the machine's updated status.
            await Clients.All.SendAsync("MachinesStatus", MachineStore.Machines.Values);

            _logger.LogInformation($"Machine with ID {machineId} status updated to 'Online' after execution.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"An error occurred while processing the execution result for machine with ID: {machineId}.");
            throw;
        }
    }
}
