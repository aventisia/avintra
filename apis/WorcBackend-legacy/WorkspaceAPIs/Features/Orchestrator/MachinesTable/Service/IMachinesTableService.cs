namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for managing machine-related operations.
/// </summary>
public interface IMachinesTableService
{
    /// <summary>
    /// Retrieves a list of all machines.
    /// </summary>
    /// <returns>A service response containing a collection of machines.</returns>
    Task<ServiceResponse<IEnumerable<MachinesTableRowDto>>> GetMachinesAsync();

    /// <summary>
    /// Retrieves a machine by its ID.
    /// </summary>
    /// <param name="machineId">The unique identifier of the machine.</param>
    /// <returns>A service response containing the machine details.</returns>
    Task<ServiceResponse<MachineRecordDto>> GetMachineAsync(Guid machineId);

    /// <summary>
    /// Updates an existing machine.
    /// </summary>
    /// <param name="updateMachineDto">The updated machine details.</param>
    /// <returns>A service response containing the updated machine data.</returns>
    Task<ServiceResponse<MachinesTableRowDto>> UpdateMachineAsync(UpdateMachineDto updateMachineDto);

    /// <summary>
    /// Deletes an existing machine.
    /// </summary>
    /// <param name="machineId">The unique identifier of the machine to be deleted.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteMachineAsync(Guid machineId);

    /// <summary>
    /// Deletes multiple machines by their IDs.
    /// </summary>
    /// <param name="machineIds">A collection of machine IDs to be deleted.</param>
    /// <returns>A service response containing the number of machines deleted.</returns>
    Task<ServiceResponse<long>> DeleteMachinesAsync(IEnumerable<Guid> machineIds);
}