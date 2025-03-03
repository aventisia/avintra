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
    /// Assigns multiple agents to a machine asynchronously.
    /// </summary>
    /// <param name="machineId">The ID of the machine to which agents will be assigned.</param>
    /// <param name="agentIds">A collection of IDs representing the agents to be assigned.</param>
    /// <returns>A service response indicating whether the agent assignment was successful or not.</returns>
    Task<ServiceResponse<bool>> AssignAgentsToMachineAsync(Guid machineId, IEnumerable<Guid> agentIds);

    /// <summary>
    /// Removes multiple agents from a machine asynchronously.
    /// </summary>
    /// <param name="machineId">The ID of the machine from which agents will be removed.</param>
    /// <param name="agentIds">A collection of IDs representing the agents to be removed.</param>
    /// <returns>A service response indicating whether the agent removal was successful or not.</returns>
    Task<ServiceResponse<bool>> RemoveAgentsFromMachineAsync(Guid machineId, IEnumerable<Guid> agentIds);

    /// <summary>
    /// Retrieves a list of agents assigned to a machine asynchronously.
    /// </summary>
    /// <param name="machineId">The ID of the machine for which assigned agents will be retrieved.</param>
    /// <returns>A service response containing a list of agents assigned to the specified machine.</returns>
    Task<ServiceResponse<IEnumerable<AssignAgentDto>>> GetAgentsByMachineAsync(Guid machineId);
}