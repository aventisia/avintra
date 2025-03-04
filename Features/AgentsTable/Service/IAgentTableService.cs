namespace WorkspaceAPIs.Services;
public interface IAgentTableService
{
    /// <summary>
    /// Fetch the list of published versions for a specific flow.
    /// </summary>
    /// <param name="flowId">Flow Id</param>
    /// <returns>A list of published flow versions</returns>
    Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetPublishFlowVersionsAsync(Guid? flowId);

    /// <summary>
    /// Fetch the list of archived versions for a specific flow.
    /// </summary>
    /// <param name="flowId">Flow Id</param>
    /// <returns>A list of archived flow versions</returns>
    Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetArchiveFlowVersionsAsync(Guid? flowId);

    /// <summary>
    /// Fetch the list of executable versions for a specific flow.
    /// </summary>
    /// <param name="flowId">Flow Id</param>
    /// <returns>A list of executable flow versions</returns>
    Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetExecuteFlowVersionsAsync(Guid? flowId);

    /// <summary>
    /// Assign a set of machines to a specified agent.
    /// </summary>
    /// <param name="agentId">The ID of the agent to whom the machines will be assigned.</param>
    /// <param name="machineIds">A collection of machine IDs to be assigned to the agent.</param>
    /// <returns>A service response indicating whether the operation was successful.</returns>
    Task<ServiceResponse<bool>> AssignMachinesToAgentAsync(Guid agentId, IEnumerable<Guid> machineIds);

    /// <summary>
    /// Remove a set of machines from a specified agent.
    /// </summary>
    /// <param name="agentId">The ID of the agent from whom the machines will be removed.</param>
    /// <param name="machineIds">A collection of machine IDs to be removed from the agent.</param>
    /// <returns>A service response indicating whether the operation was successful.</returns>
    Task<ServiceResponse<bool>> RemoveMachinesFromAgentAsync(Guid agentId, IEnumerable<Guid> machineIds);

    /// <summary>
    /// Fetch all machines currently assigned to a specified agent.
    /// </summary>
    /// <param name="agentId">The ID of the agent whose assigned machines are to be retrieved.</param>
    /// <returns>A service response containing a list of machines assigned to the agent.</returns>
    Task<ServiceResponse<IEnumerable<AssignMachineDto>>> GetMachinesByAgentAsync(Guid agentId);
}