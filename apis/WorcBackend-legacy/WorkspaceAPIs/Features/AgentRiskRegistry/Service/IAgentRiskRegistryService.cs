namespace WorkspaceAPIs.Services;

public interface IAgentRiskRegistryService
{
    /// <summary>
    /// Retrieves all registry rows for the agent risk registry table.
    /// </summary>
    Task<ServiceResponse<IEnumerable<AgentRiskRegistryRowDto>>> GetAllRowsAsync();

    /// <summary>
    /// Retrieves the full registry record for a specific flow version (agent).
    /// </summary>
    Task<ServiceResponse<AgentRiskRegistryDto>> GetByFlowVersionAsync(Guid flowVersionId);

    /// <summary>
    /// Upserts the registry record for a flow version. The backend resolves and
    /// persists the AI-model and third-party-tool lists from the flow config.
    /// </summary>
    Task<ServiceResponse<AgentRiskRegistryDto>> UpsertAsync(AgentRiskRegistryUpsertDto dto);

    /// <summary>
    /// Retrieves the registry rows that are pending the current user's approval.
    /// </summary>
    Task<ServiceResponse<IEnumerable<AgentRiskRegistryRowDto>>> GetPendingApprovalsAsync();
}
