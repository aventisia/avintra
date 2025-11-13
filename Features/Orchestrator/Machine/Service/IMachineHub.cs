
namespace WorkspaceAPIs.Hubs;

/// <summary>
/// Defines the contract for the MachineHub, responsible for managing machine connections, heartbeats, 
/// task execution results, and disconnections.
/// </summary>
public interface IMachineHub
{
    /// <summary>
    /// Registers a machine when it connects, setting its status to "Online" if it's not already registered.
    /// If the machine is already registered, the method does nothing.
    /// </summary>
    /// <param name="machineId">The unique identifier for the machine being registered.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task RegisterMachineAsync(Guid machineId);

    /// <summary>
    /// Handles heartbeat updates from machines, ensuring their status remains "Online". 
    /// This method is invoked periodically by machines to inform the hub of their status.
    /// </summary>
    /// <param name="machineId">The unique identifier for the machine sending the heartbeat.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task Heartbeat(Guid machineId);

    /// <summary>
    /// Handles the execution result of a machine task. After execution completes, the machine status is updated to "Idle".
    /// </summary>
    /// <param name="machineId">The unique identifier for the machine that executed the task.</param>
    /// <param name="executionOutput">The result or output of the executed task.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ExecutionResult(string machineId, string executionOutput);
}
