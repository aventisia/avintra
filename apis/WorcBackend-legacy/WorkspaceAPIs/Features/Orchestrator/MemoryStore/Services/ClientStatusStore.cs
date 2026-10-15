namespace WorkspaceAPIs.Services;

public class ClientStatusStore : IClientStatusStore
{
    // Authoritative client status, keyed by ClientId. Job-execution logic reads this
    // (machine Status/AgentId/JobId), so its per-client semantics are preserved.
    private readonly ConcurrentDictionary<Guid, ClientDataStore> ClientStore;

    // Connection registry: maps an active SignalR ConnectionId to its owning ClientId.
    // This makes the store connection-aware: a user with multiple tabs/connections holds
    // multiple connections under the same ClientId, so disconnecting one no longer evicts
    // the client's presence.
    private readonly ConcurrentDictionary<string, Guid> ConnectionToClient;

    // Live connection count per ClientId, used to decide when the last connection has left.
    private readonly ConcurrentDictionary<Guid, int> ClientConnectionCounts;

    private readonly WorkspaceDbContext _workspaceDbContext;
    private readonly ILogger<ClientStatusStore> _logger;

    public ClientStatusStore(
        ConcurrentDictionary<Guid, ClientDataStore> clientStore,
        ConcurrentDictionary<string, Guid> connectionToClient,
        ConcurrentDictionary<Guid, int> clientConnectionCounts,
        WorkspaceDbContext workspaceDbContext,
        ILogger<ClientStatusStore> logger)
    {
        ClientStore = clientStore;
        ConnectionToClient = connectionToClient;
        ClientConnectionCounts = clientConnectionCounts;
        _workspaceDbContext = workspaceDbContext;
        _logger = logger;
    }

    // Adds or updates the client's status in the store. Registers the connection so a later
    // disconnect only removes the client once its last connection is gone.
    public async Task AddOrUpdateStatusAsync(ClientDataStore req)
    {
        var client = new ClientDataStore
        {
            TenantId = req.TenantId,
            ClientId = req.ClientId,
            ConnectionId = req.ConnectionId,
            ClientName = req.ClientName,
            Type = req.Type,
            Status = req.Status,
            LastSeen = DateTimeOffset.UtcNow,
            AgentId = req.AgentId,
            JobId = req.JobId
        };

        ClientStore.AddOrUpdate(req.ClientId, client, (_, __) => client);

        // Register the connection for this client so presence survives multiple connections.
        if (ConnectionToClient.TryAdd(req.ConnectionId, req.ClientId))
        {
            ClientConnectionCounts.AddOrUpdate(req.ClientId, 1, (_, c) => c + 1);
        }

        // Persist the last check-in timestamp for machine clients.
        await UpdateMachineLastCheckedInAsync(client);
    }

    // Removes the given connection from the store. The client's presence entry is only removed
    // once its last connection has left.
    public async Task RemoveClientByConnectionAsync(string connectionId)
    {
        if (!ConnectionToClient.TryRemove(connectionId, out var clientId))
        {
            // Unknown connection; nothing to remove.
            return;
        }

        var remaining = ClientConnectionCounts.AddOrUpdate(clientId, 0, (_, c) => Math.Max(0, c - 1));
        if (remaining > 0)
        {
            // The client still has other live connections; keep its presence entry.
            return;
        }

        // Last connection for this client is gone — remove its presence entry.
        ClientConnectionCounts.TryRemove(clientId, out _);
        if (ClientStore.TryRemove(clientId, out var removed))
        {
            // Persist the disconnect time for machine clients before removing them.
            await UpdateMachineLastCheckedInAsync(removed);
        }
    }

    // Retrieves the status of a client by their connection ID. Resolves the owning ClientId
    // through the connection registry so non-primary connections (e.g. a second browser tab)
    // can still locate their client's presence entry.
    public Task<ClientDataStore?> GetStatusByConnectionIdAsync(string connectionId)
    {
        if (ConnectionToClient.TryGetValue(connectionId, out var clientId)
            && ClientStore.TryGetValue(clientId, out var clientDataStore))
        {
            return Task.FromResult<ClientDataStore?>(clientDataStore);
        }

        // Fallback for connections registered before the registry existed.
        var clientData = ClientStore.Values
            .FirstOrDefault(w => w.ConnectionId == connectionId);

        if (clientData != null && ClientStore.TryGetValue(clientData.ClientId, out var fallbackStore))
        {
            return Task.FromResult<ClientDataStore?>(fallbackStore);
        }

        // Return null if no client found with the given connection ID.
        return Task.FromResult<ClientDataStore?>(null);
    }

    // Retrieves the status of a client by their client ID.
    public Task<ClientDataStore?> GetStatusByClientIdAsync(Guid clientId)
    {
        // Find the client by its client ID.
        if (ClientStore.TryGetValue(clientId, out var clientDataStore))
        {
            // Return the client status if found.
            return Task.FromResult<ClientDataStore?>(clientDataStore);
        }

        // Return null if no client found with the given client ID.
        return Task.FromResult<ClientDataStore?>(null);
    }

    // Retrieves a list of machine clients for a specific tenant.
    public Task<IEnumerable<ClientDataStore>> GetMachineStatusesAsync(Guid tenantId)
    {
        var machines = ClientStore.Values
            .Where(w => w.TenantId == tenantId && w.Type == ClientTypesEnum.AvintraMachine)
            .ToList();

        return Task.FromResult<IEnumerable<ClientDataStore>>(machines);
    }

    // Retrieves a client based on the unique client identifier (clientId) for the AvintraMachine type.
    public Task<ClientDataStore?> GetClientByIdAsync(Guid clientId)
    {
        var machine = ClientStore.Values
            .FirstOrDefault(w => w.ClientId == clientId && w.Type == ClientTypesEnum.AvintraMachine);

        return Task.FromResult<ClientDataStore?>(machine);
    }

    // Retrieves a list of user clients for a specific tenant.
    public Task<IEnumerable<ClientDataStore>> GetUserStatusesAsync(Guid tenantId)
    {
        var users = ClientStore.Values
            .Where(w => w.TenantId == tenantId &&
                (w.Type == ClientTypesEnum.WebBrowser || w.Type == ClientTypesEnum.AvintraDesktopApp))
            .ToList();

        return Task.FromResult<IEnumerable<ClientDataStore>>(users);
    }

    // Updates the status of a client by their clientId.
    public async Task UpdateClientStatusAsync(ClientDataStore clientDataStore)
    {
        // Attempt to find and update the client's status by clientId.
        if (ClientStore.TryGetValue(clientDataStore.ClientId, out var existingClient))
        {
            existingClient.Status = clientDataStore.Status;
            existingClient.LastSeen = DateTimeOffset.UtcNow;
            // Persist the job/agent association too. JobId doubles as the pending marker for a
            // dispatched-but-not-started job, so it must survive an in-place update.
            existingClient.AgentId = clientDataStore.AgentId;
            existingClient.JobId = clientDataStore.JobId;

            // Persist the last check-in timestamp for machine clients.
            await UpdateMachineLastCheckedInAsync(existingClient);
        }
    }

    // Retrieves the first client associated with the specified job ID.
    public Task<ClientDataStore?> GetStatusByJobIdAsync(Guid jobId)
    {
        // Find the first client whose JobId matches the specified job ID.
        var client = ClientStore.Values
            .FirstOrDefault(w => w.JobId == jobId);

        // Return the matching client if found; otherwise, return null.
        return Task.FromResult<ClientDataStore?>(client);
    }

    // Retrieves a snapshot of all online client presence entries for a tenant.
    public Task<IEnumerable<ClientDataStore>> GetPresenceAsync(Guid tenantId)
    {
        var presence = ClientStore.Values
            .Where(w => w.TenantId == tenantId)
            .ToList();

        return Task.FromResult<IEnumerable<ClientDataStore>>(presence);
    }

    // Retrieves a machine client by its unique name within a tenant.
    public Task<ClientDataStore?> GetClientByNameAsync(Guid tenantId, string clientName)
    {
        var machine = ClientStore.Values
            .FirstOrDefault(w =>
                w.TenantId == tenantId &&
                w.Type == ClientTypesEnum.AvintraMachine &&
                !string.IsNullOrEmpty(w.ClientName) &&
                string.Equals(w.ClientName, clientName, StringComparison.OrdinalIgnoreCase));

        return Task.FromResult<ClientDataStore?>(machine);
    }

    // Persists the machine's LastCheckedIn timestamp to the database.
    // Only applies to machine clients; other client types are ignored.
    // Failures are logged and swallowed so the in-memory status update is never blocked.
    private async Task UpdateMachineLastCheckedInAsync(ClientDataStore clientDataStore)
    {
        if (clientDataStore.Type != ClientTypesEnum.AvintraMachine)
            return;

        try
        {
            var machine = await _workspaceDbContext.Machines
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(m =>
                    m.Id == clientDataStore.ClientId &&
                    m.TenantId == clientDataStore.TenantId);

            if (machine == null)
                return;

            machine.LastCheckedIn = DateTimeOffset.UtcNow.UtcDateTime;
            await _workspaceDbContext.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Failed to update LastCheckedIn for machine {MachineId}. Continuing in-memory status update.",
                clientDataStore.ClientId);
        }
    }
}