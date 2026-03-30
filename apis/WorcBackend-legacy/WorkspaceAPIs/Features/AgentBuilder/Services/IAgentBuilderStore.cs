namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides methods for managing AI chat user sessions, including connection tracking and LLM execution state.
/// </summary>
public interface IAgentBuilderStore
{
    /// <summary>
    /// Adds a new AI chat user or updates an existing session.
    /// </summary>
    /// <param name="user">The AI chat user model.</param>
    Task AddOrUpdateAsync(AgentBuilderModel user);

    /// <summary>
    /// Removes users associated with a specific connection ID.
    /// Typically called when a connection is closed or lost.
    /// </summary>
    /// <param name="connectionId">The connection identifier.</param>
    Task RemoveByConnectionIdAsync(string connectionId);

    /// <summary>
    /// Retrieves a user session by connection ID.
    /// </summary>
    /// <param name="connectionId">The connection identifier.</param>
    /// <returns>The matching user session or null.</returns>
    Task<AgentBuilderModel?> GetByConnectionIdAsync(string connectionId);

    /// <summary>
    /// Retrieves a user session by user ID.
    /// </summary>
    /// <param name="userId">The user identifier.</param>
    /// <returns>The matching user session or null.</returns>
    Task<AgentBuilderModel?> GetByClientIdAsync(Guid userId);

    /// <summary>
    /// Retrieves all active chat users for a tenant.
    /// </summary>
    /// <param name="tenantId">The tenant identifier.</param>
    Task<IEnumerable<AgentBuilderModel>> GetByTenantAsync(Guid tenantId);

    /// <summary>
    /// Retrieves all currently connected users.
    /// </summary>
    Task<IEnumerable<AgentBuilderModel>> GetConnectedUsersAsync();
}