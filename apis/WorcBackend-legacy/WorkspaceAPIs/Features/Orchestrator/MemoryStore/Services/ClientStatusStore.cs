namespace WorkspaceAPIs.Services;

public class ClientStatusStore : IClientStatusStore
{
    // Thread-safe dictionary to store client statuses, with the clientId as the key.
    private readonly ConcurrentDictionary<Guid, ClientDataStore> ClientStore;
    private readonly WorkspaceDbContext _workspaceDbContext;
    private readonly ILogger<ClientStatusStore> _logger;

    public ClientStatusStore(ConcurrentDictionary<Guid, ClientDataStore> clientStore, WorkspaceDbContext workspaceDbContext, ILogger<ClientStatusStore> logger)
    {
        ClientStore = clientStore;
        _workspaceDbContext = workspaceDbContext;
        _logger = logger;
    }

    // Adds or updates the client's status in the store.
    public async Task AddOrUpdateStatusAsync(ClientDataStore req)
    {
        var client = new ClientDataStore
        {
            TenantId = req.TenantId,
            ClientId = req.ClientId,
            ConnectionId = req.ConnectionId,
            Type = req.Type,
            Status = req.Status,
            LastSeen = DateTimeOffset.UtcNow,
            AgentId = req.AgentId,
            JobId = req.JobId
        };

        ClientStore.AddOrUpdate(req.ClientId, client, (_, __) => client);

        // Persist the last check-in timestamp for machine clients.
        await UpdateMachineLastCheckedInAsync(client);
    }

    // Removes all clients from the store by their connection identifier.
    public async Task RemoveClientByConnectionAsync(string connectionId)
    {
        // Find all clients with the matching connection ID
        var clientsToRemove = ClientStore.Values
            .Where(w => w.ConnectionId == connectionId)
            .ToList();

        // If any clients are found, remove them from the store
        foreach (var client in clientsToRemove)
        {
            // Persist the disconnect time for machine clients before removing them.
            await UpdateMachineLastCheckedInAsync(client);

            ClientStore.TryRemove(client.ClientId, out _);
        }
    }

    // Retrieves the status of a client by their client ID.
    public Task<ClientDataStore?> GetStatusByConnectionIdAsync(string connectionId)
    {
        // Find the client by its connection ID.
        var clientData = ClientStore.Values
            .FirstOrDefault(w => w.ConnectionId == connectionId
                && (w.Type == ClientTypesEnum.AvintraMachine || w.Type != ClientTypesEnum.AvintraMachine));

        // Return the client status by clientId if found.
        if (clientData != null && ClientStore.TryGetValue(clientData.ClientId, out var clientDataStore))
        {
            return Task.FromResult<ClientDataStore?>(clientDataStore);
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