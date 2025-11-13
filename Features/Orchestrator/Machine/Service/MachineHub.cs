namespace WorkspaceAPIs.Hubs;

[Authorize]
public class MachineHub : Hub, IMachineHub
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MachineHub> _logger;

    public MachineHub(IUnitOfWork unitOfWork, ILogger<MachineHub> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    // Registers a machine when it connects, setting its status to "Online" if not already registered.
    public async Task RegisterMachineAsync(Guid machineId)
    {
        try
        {
            _logger.LogInformation($"Attempting to register machine with ID: {machineId}");

            // Check if the machine is already registered in the in-memory store
            if (MachineStore.Machines.TryGetValue(machineId, out var existingMachineDto))
            {
                _logger.LogWarning($"Machine with ID {machineId} is already registered. Skipping registration.");
                return;
            }

            // Fetch machine details from the database
            var machineEntity = await _unitOfWork.MachineRepo.GetByConditionAsync(w => w.Id == machineId).SingleOrDefaultAsync();
            if (machineEntity == null)
            {
                _logger.LogWarning($"Machine with ID {machineId} not found in the database.");
                return;
            }

            // Update machine status to "Online" and persist changes
            machineEntity.Status = MachineStatusTypeEnum.Online;
            machineEntity.LastCheckedIn = DateTime.UtcNow;
            machineEntity.LastModifiedByUserId = machineEntity.LastModifiedByUserId;

            _unitOfWork.MachineRepo.Update(machineEntity);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to update machine with ID {machineId} and set it to Online. Machine details: {machineEntity}");
            }

            // Create DTO for the machine and store it in memory
            var machineDto = machineEntity.Adapt<MachineDto>();
            machineDto.ConnectionId = Context.ConnectionId;
            MachineStore.Machines[machineId] = machineDto;

            // Notify all clients about the machine status update
            await Clients.All.SendAsync("MachineStatusUpdated", machineDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while registering the machine with ID: {machineId}.");
            throw;
        }
    }

    // Handles heartbeat updates from machines, ensuring their status remains "Online".
    public async Task Heartbeat(Guid machineId)
    {
        try
        {
            _logger.LogInformation($"Received heartbeat from machine with ID: {machineId}");

            // Check if the machine exists in the in-memory store
            if (!MachineStore.Machines.TryGetValue(machineId, out var machineDto))
            {
                _logger.LogWarning($"Machine with ID {machineId} not found in the in-memory store.");
                return;
            }

            // Update the heartbeat timestamp and ensure the status is "Online"
            machineDto.LastCheckedIn = DateTime.UtcNow;
            machineDto.Status = MachineStatusTypeEnum.Online;

            // Update the in-memory store
            MachineStore.Machines[machineId] = machineDto;

            // Notify all clients of the updated machine status
            await Clients.All.SendAsync("MachineStatusUpdated", machineDto);
            _logger.LogInformation($"Heartbeat received for machine {machineId}. Status updated to {machineDto.Status}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while processing the heartbeat for machine with ID: {machineId}.");
            throw;
        }
    }

    // Handles the execution result of a machine task, setting its status to "Idle" once completed.
    public async Task ExecutionResult(string machineId, string executionOutput)
    {
        try
        {
            _logger.LogInformation($"Received execution result for machine with ID: {machineId}. Output: {executionOutput}");

            // Convert machineId to GUID and check if the machine exists in the in-memory store
            if (!MachineStore.Machines.TryGetValue(Guid.Parse(machineId), out var machineDto))
            {
                _logger.LogWarning($"Machine with ID {machineId} not found in the in-memory store.");
                return;
            }

            // Update machine status to "Running" while execution is ongoing
            machineDto.Status = MachineStatusTypeEnum.Running;
            machineDto.LastCheckedIn = DateTime.UtcNow;

            // Update the in-memory store
            MachineStore.Machines[machineDto.Id] = machineDto;

            // Notify all clients of the updated machine status
            await Clients.All.SendAsync("MachineStatusUpdated", machineDto);

            // Todo: Add logic for executions

            // After execution completes, update the status to "Idle"
            machineDto.Status = MachineStatusTypeEnum.Idle;

            // Update the in-memory store again with the new status
            MachineStore.Machines[machineDto.Id] = machineDto;

            // Notify clients of the updated idle status
            await Clients.All.SendAsync("MachineStatusUpdated", machineDto);
            _logger.LogInformation($"Machine with ID {machineId} status updated to Idle after execution.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while processing the execution result for machine ID: {machineId}.");
            throw;
        }
    }

    // Handles the disconnection of machines. Sets their status to "Offline" and removes them from the store.
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            _logger.LogInformation($"Machine with Connection ID {Context.ConnectionId} disconnected.");

            // Find the machine in the in-memory store by its connection ID
            var disconnectedMachineDto = MachineStore.Machines.Values.SingleOrDefault(m => m.ConnectionId == Context.ConnectionId);
            if (disconnectedMachineDto != null)
            {
                // Set machine status to "Offline" and remove from store
                disconnectedMachineDto.Status = MachineStatusTypeEnum.Offline;
                MachineStore.Machines.Remove(disconnectedMachineDto.Id);

                // Notify clients of the updated status
                await Clients.All.SendAsync("MachineStatusUpdated", disconnectedMachineDto);
                _logger.LogInformation($"Machine with Connection ID {Context.ConnectionId} has been set to Offline.");
            }
            else
            {
                _logger.LogWarning($"No machine found with Connection ID {Context.ConnectionId} during disconnection.");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error occurred while handling machine disconnection with Connection ID {Context.ConnectionId}.");
            throw;
        }

        await base.OnDisconnectedAsync(exception);
    }
}
