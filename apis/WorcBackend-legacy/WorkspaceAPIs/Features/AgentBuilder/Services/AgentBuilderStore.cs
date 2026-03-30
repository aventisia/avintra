namespace WorkspaceAPIs.Services;

public class AgentBuilderStore : IAgentBuilderStore
{
    // Thread-safe store of AI chat users (key = UserId)
    private readonly ConcurrentDictionary<Guid, AgentBuilderModel> _agentBuilderStore;

    public AgentBuilderStore(ConcurrentDictionary<Guid, AgentBuilderModel> agentBuilderStore)
    {
        _agentBuilderStore = agentBuilderStore;
    }

    /// <summary>
    /// Adds or updates a user's chat session.
    /// </summary>
    public Task AddOrUpdateAsync(AgentBuilderModel req)
    {
        var model = new AgentBuilderModel
        {
            ConnectionId = req.ConnectionId,
            TenantId = req.TenantId,
            UserId = req.UserId,
            LastSeen = DateTimeOffset.UtcNow
        };

        _agentBuilderStore.AddOrUpdate(req.UserId, model, (_, __) => model);

        return Task.CompletedTask;
    }

    /// <summary>
    /// Removes users by connection ID.
    /// </summary>
    public Task RemoveByConnectionIdAsync(string connectionId)
    {
        var usersToRemove = _agentBuilderStore.Values
            .Where(x => x.ConnectionId == connectionId)
            .ToList();

        foreach (var user in usersToRemove)
        {
            _agentBuilderStore.TryRemove(user.UserId, out _);
        }

        return Task.CompletedTask;
    }

    /// <summary>
    /// Get user by connection ID.
    /// </summary>
    public Task<AgentBuilderModel?> GetByConnectionIdAsync(string connectionId)
    {
        var user = _agentBuilderStore.Values
            .FirstOrDefault(x => x.ConnectionId == connectionId);

        return Task.FromResult(user);
    }

    /// <summary>
    /// Get user by client ID.
    /// </summary>
    public Task<AgentBuilderModel?> GetByClientIdAsync(Guid userId)
    {
        _agentBuilderStore.TryGetValue(userId, out var user);
        return Task.FromResult(user);
    }

    /// <summary>
    /// Get all users for a tenant.
    /// </summary>
    public Task<IEnumerable<AgentBuilderModel>> GetByTenantAsync(Guid tenantId)
    {
        var users = _agentBuilderStore.Values
            .Where(x => x.TenantId == tenantId)
            .ToList();

        return Task.FromResult<IEnumerable<AgentBuilderModel>>(users);
    }

    /// <summary>
    /// Get currently connected users.
    /// </summary>
    public Task<IEnumerable<AgentBuilderModel>> GetConnectedUsersAsync()
    {
        var users = _agentBuilderStore.Values.ToList();

        return Task.FromResult<IEnumerable<AgentBuilderModel>>(users);
    }
}