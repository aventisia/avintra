namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for managing machine-related operations.
/// </summary>
public interface IMachineService
{
    /// <summary>
    /// Creates a new machine.
    /// </summary>
    /// <param name="machineDto">The machine details.</param>
    /// <returns>A service response containing the created machine data.</returns>
    Task<ServiceResponse<MachineDto>> CreateNewMachineAsync(MachineDto machineDto);

    /// <summary>
    /// Retrieves a list of all machines.
    /// </summary>
    /// <returns>A service response containing a collection of machines.</returns>
    Task<ServiceResponse<IEnumerable<MachineDto>>> GetMachineListAsync();

    /// <summary>
    /// Deletes a specific machine.
    /// </summary>
    /// <param name="machineId">The unique identifier of the machine to be deleted.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteMachineAsync(Guid machineId);

    /// <summary>
    /// Retrieves details of a specific machine.
    /// </summary>
    /// <param name="machineId">The unique identifier of the machine.</param>
    /// <returns>A service response containing the machine details.</returns>
    Task<ServiceResponse<MachineDto>> GetMachineAsync(Guid machineId);

    /// <summary>
    /// Updates an existing machine.
    /// </summary>
    /// <param name="machineDto">The updated machine details.</param>
    /// <returns>A service response containing the updated machine data.</returns>
    Task<ServiceResponse<MachineDto>> UpdateMachineAsync(MachineDto machineDto);

    /// <summary>
    /// Deletes multiple machines.
    /// </summary>
    /// <param name="machineIds">A collection of machine IDs to be deleted.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteMachinesAsync(IEnumerable<Guid> machineIds);

    // Uncomment if needed

    // /// <summary>
    // /// Removes all operations assigned to a machine.
    // /// </summary>
    // /// <param name="id">The machine ID.</param>
    // /// <returns>A service response indicating success or failure.</returns>
    // Task<ServiceResponse<bool>> RemoveAllOperationsAsync(Guid id);

    // /// <summary>
    // /// Assigns an operation to a machine.
    // /// </summary>
    // /// <param name="operation">The operation details to be assigned.</param>
    // /// <returns>A service response indicating success or failure.</returns>
    // Task<ServiceResponse<bool>> AssignOperationToMachineAsync(MachineOperationDto operation);

    // /// <summary>
    // /// Retrieves the status of a specific machine.
    // /// </summary>
    // /// <param name="machineId">The unique identifier of the machine.</param>
    // /// <returns>The status of the machine as an enumeration.</returns>
    // Task<MachineStatusTypeEnum> GetMachineStatusAsync(Guid machineId);
}