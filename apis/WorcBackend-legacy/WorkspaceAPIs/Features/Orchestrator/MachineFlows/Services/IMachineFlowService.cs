namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the operations related to managing machine flow data.
/// </summary>
public interface IMachineFlowService
{
    /// <summary>
    /// Inserts a new machine flow record asynchronously.
    /// </summary>
    /// <param name="machineFlowDto">The machine flow data to be inserted.</param>
    /// <returns>A service response containing the inserted machine flow data.</returns>
    Task<ServiceResponse<MachineFlowDto>> InsertMachineFlowAsync(MachineFlowDto machineFlowDto);

    /// <summary>
    /// Deletes a machine flow record asynchronously using its composite key.
    /// </summary>
    /// <param name="machineId">The machine ID of the machine flow relation.</param>
    /// <param name="flowVersionId">The flow version ID of the machine flow relation.</param>
    /// <returns>A service response indicating the success or failure of the delete operation.</returns>
    Task<ServiceResponse<bool>> DeleteMachineFlowAsync(Guid machineId, Guid flowVersionId);

    /// <summary>
    /// Retrieves a collection of machine flows asynchronously for a specific machine.
    /// </summary>
    /// <param name="machineId">The optional machine ID to filter the machine flows. If null, retrieves all machine flows.</param>
    /// <returns>A service response containing a collection of machine flow data.</returns>
    Task<ServiceResponse<IEnumerable<MachineFlowDto>>> GetMachineFlowsAsync(Guid? machineId);

    /// <summary>
    /// Retrieves a specific machine flow record asynchronously using its composite key.
    /// </summary>
    /// <param name="machineId">The machine ID of the machine flow relation.</param>
    /// <param name="flowVersionId">The flow version ID of the machine flow relation.</param>
    /// <returns>A service response containing the requested machine flow data.</returns>
    Task<ServiceResponse<MachineFlowDto>> GetMachineFlowAsync(Guid machineId, Guid flowVersionId);

    /// <summary>
    /// Updates an existing machine flow record asynchronously.
    /// </summary>
    /// <param name="machineFlowDto">The machine flow data to be updated.</param>
    /// <returns>A service response containing the updated machine flow data.</returns>
    Task<ServiceResponse<MachineFlowDto>> UpdateMachineAsync(MachineFlowDto machineFlowDto);

    /// <summary>
    /// Deletes multiple machine flow records asynchronously using composite keys.
    /// </summary>
    /// <param name="machineFlowKeys">The collection of machine-flow composite keys to be deleted.</param>
    /// <returns>A service response indicating the success or failure of the delete operation.</returns>
    Task<ServiceResponse<bool>> DeleteMachineFlowsAsync(IEnumerable<MachineFlowKeyDto> machineFlowKeys);
}