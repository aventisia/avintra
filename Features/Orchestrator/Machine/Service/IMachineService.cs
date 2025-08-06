namespace WorkspaceAPIs.Services;

/// <summary>
/// Service interface for managing machine-related operations.
/// </summary>
public interface IMachineService
{
    /// <summary>
    /// Checks the availability of a machine name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the machine name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the machine name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsMachineNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

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

    /// <summary>
    /// Retrieves a list of agents assigned to a machine asynchronously.
    /// </summary>
    /// <param name="machineId">The ID of the machine for which assigned agents will be retrieved.</param>
    /// <returns>A service response containing a list of agents assigned to the specified machine.</returns>
    Task<ServiceResponse<IEnumerable<AssignAgentDto>>> GetAgentsByMachineAsync(Guid machineId);

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
    /// A <see cref="ServiceResponse{T}"/> containing a collection of <see cref="MachineDto"/> objects matching the search criteria.
    /// </returns>
    Task<ServiceResponse<IEnumerable<MachineDto>>> FindMachinesByKeywordAsync(string searchKey);
}