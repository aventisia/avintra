namespace WorkspaceAPIs.Services;
public interface IAgentTableService
{
    /// <summary>
    /// Fetch the list of published versions for a specific flow.
    /// </summary>
    /// <param name="flowId">Flow Id</param>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal agents. If <c>false</c>, returns only shared agents. </param>
    /// <returns>A list of published flow versions</returns>
    Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetPublishFlowVersionsAsync(Guid? flowId, bool isPersonal);

    /// <summary>
    /// Updates the details of a specific flow version.
    /// </summary>
    /// <param name="agentTableDto">The DTO containing updated flow version details.</param>
    /// <returns>A service response containing the updated flow version data.</returns>
    Task<ServiceResponse<AgentTableDto>> UpdateFlowVersionAsync(AgentTableDto agentTableDto);

    /// <summary>
    /// Fetch the list of archived versions for a specific flow.
    /// </summary>
    /// <param name="flowId">Flow Id</param>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal agents. If <c>false</c>, returns only shared agents. </param>
    /// <returns>A list of archived flow versions</returns>
    Task<ServiceResponse<IEnumerable<AgentTableDto>>> GetArchiveFlowVersionsAsync(Guid? flowId, bool isPersonal);

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

    /// <summary>
    /// Search and retrieve all published flow versions where the flow name contains the specified search keyword.
    /// </summary>
    /// <param name="searchKey">The keyword used to search flow names.</param>
    /// <param name="isPersonal"> If <c>true</c>, returns only personal agents. If <c>false</c>, returns only shared agents. </param>
    /// <returns>
    /// A <see cref="ServiceResponse{T}"/> containing a list of <see cref="AgentTableDto"/> objects representing the published flow versions matching the search criteria.
    /// </returns>
    Task<ServiceResponse<IEnumerable<AgentTableDto>>> SearchPublishFlowVersionsAsync(string searchKey, bool isPersonal);

    /// <summary>
    /// Disables multiple flow versions based on the provided list of flow version IDs.
    /// </summary>
    /// <param name="flowVersionIds">A list of flow version IDs to be disabled.</param>
    /// <returns>
    /// A <see cref="ServiceResponse{T}"/> containing a list of <see cref="bool"/> values where each boolean represents whether the corresponding flow version was successfully disabled (true) or failed (false).
    /// </returns>
    Task<ServiceResponse<bool>> DisableMultipleFlowVersionsAsync(IEnumerable<Guid> flowVersionIds);

    /// <summary>
    /// Gets the total count of published flow versions.
    /// A <see cref="ServiceResponse{T}"/> with the count of published flow versions.
    /// </returns>
    Task<ServiceResponse<int>> GetTotalPublishedFlowVersionsAsync();
}