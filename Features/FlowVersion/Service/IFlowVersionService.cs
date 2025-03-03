namespace WorkspaceAPIs.Services;
public interface IFlowVersionService
{
    /// <summary>
    /// Get a list of flow versions of a flow using flow identifier
    /// </summary>
    /// <param name="flowId">Flow Id</param>
    /// <returns>A list of flow versions</returns>
    Task<ServiceResponse<IEnumerable<FlowVersionDto>>> GetFlowVersionsAsync(Guid flowId);

    /// <summary>
    /// Creates a new flow version
    /// </summary>
    /// <param name="flowVersionDto">Flow version dto</param>
    /// <returns>A newly created flow version</returns>
    Task<ServiceResponse<FlowVersionDto>> InsertFlowVersionAsync(FlowVersionDto flowVersionDto);

    /// <summary>
    /// Updates a new flow version
    /// </summary>
    /// <param name="flowVersionDto">Flow version dto</param>
    /// <returns>An updated flow version</returns>
    Task<ServiceResponse<FlowVersionDto>> UpdateFlowVersionAsync(FlowVersionDto flowVersionDto);

    /// <summary>
    /// Deletes a flow version
    /// </summary>
    /// <param name="id">Version Id</param>
    /// <returns>True, if delete job successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteFlowVersionAsync(Guid id);

    /// <summary>
    /// Assigns multiple machines to an agent.
    /// </summary>
    /// <param name="agentId">The ID of the agent to whom the machines will be assigned.</param>
    /// <param name="machineIds">A collection of machine IDs to be assigned to the agent.</param>
    /// <returns>A service response indicating whether the operation was successful.</returns>
    Task<ServiceResponse<bool>> AssignMachinesToAgentAsync(Guid agentId, IEnumerable<Guid> machineIds);

    /// <summary>
    /// Removes multiple machines from an agent.
    /// </summary>
    /// <param name="agentId">The ID of the agent from whom the machines will be removed.</param>
    /// <param name="machineIds">A collection of machine IDs to be removed from the agent.</param>
    /// <returns>A service response indicating whether the operation was successful.</returns>
    Task<ServiceResponse<bool>> RemoveMachinesFromAgentAsync(Guid agentId, IEnumerable<Guid> machineIds);

    /// <summary>
    /// Retrieves all machines assigned to a specific agent.
    /// </summary>
    /// <param name="agentId">The ID of the agent whose assigned machines are to be retrieved.</param>
    /// <returns>A service response containing a list of machines assigned to the agent.</returns>
    Task<ServiceResponse<IEnumerable<AssignMachineDto>>> GetMachinesByAgentAsync(Guid agentId);

    /// <summary>
    /// Retrieves a list of agents formatted as select options.
    /// </summary>
    /// <returns>A service response containing a list of select options for agents, including labels, values, and descriptions.</returns>
    Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetAgentToSelectOptionAsync();
}