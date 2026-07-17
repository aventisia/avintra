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
    /// Retrieves machine by its ID.
    /// </summary>
    /// <param name="machineId">The unique identifier of the machine.</param>
    /// <returns>A service response containing the machine details.</returns>
    Task<ServiceResponse<MachineRecordDto>> GetMachineAsync(Guid machineId);

    /// <summary>
    /// Insert a new machine.
    /// </summary>
    /// <param name="addMachineDto">The machine details.</param>
    /// <returns>A service response containing the created machine data.</returns>
    Task<ServiceResponse<MachinesTableRowDto>> InsertMachineAsync(AddMachineDto addMachineDto);

    /// <summary>
    /// Updates an existing machine.
    /// </summary>
    /// <param name="updateMachineDto">The updated machine details.</param>
    /// <returns>A service response containing the updated machine data.</returns>
    Task<ServiceResponse<MachinesTableRowDto>> UpdateMachineAsync(UpdateMachineDto updateMachineDto);

    /// <summary>
    /// Deletes a machine by its ID.
    /// </summary>
    /// <param name="machineId">The unique identifier of the machine to be deleted.</param>
    /// <returns>A service response indicating success or failure.</returns>
    Task<ServiceResponse<bool>> DeleteMachineAsync(Guid machineId);

    /// <summary>
    /// Delete multiple machines by their IDs.
    /// </summary>
    /// <param name="machineIds">A collection of machine IDs to be deleted.</param>
    /// <returns>A service response containing the number of machines deleted.</returns>
    Task<ServiceResponse<long>> DeleteMachinesAsync(IEnumerable<Guid> machineIds);

    // TODO: Need to check

    /// <summary>
    /// Retrieves a list of flow versions assigned to a machine asynchronously.
    /// </summary>
    /// <param name="osId">The OS ID of the machine for which assigned flow versions will be retrieved.</param>
    /// <returns>A service response containing a list of flow versions assigned to the specified machine.</returns>
    Task<ServiceResponse<IEnumerable<AssignFlowVersionDto>>> GetFlowVersionsByMachineOSIdAsync(string osId);

    /// <summary>
    /// Retrieves a list of machines formatted as select options.
    /// </summary>
    /// <returns>A service response containing a list of select options for machines, including labels, values, and descriptions.</returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetMachineToSelectOptionAsync();

    /// <summary>
    /// Searches for machines whose properties match the specified search keyword.
    /// </summary>
    /// <param name="searchKey">The keyword used to search machine details (e.g., name or identifier).</param>
    /// <returns>
    /// A <see cref="ServiceResponse{T}"/> containing a collection of <see cref="MachinesTableRowDto"/> objects matching the search criteria.
    /// </returns>
    Task<ServiceResponse<IEnumerable<MachinesTableRowDto>>> FindMachinesByKeywordAsync(string searchKey);
}