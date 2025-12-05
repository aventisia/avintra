using System.Collections.Concurrent;

namespace WorkspaceAPIs.Services;

public class ClientStatusStore : IClientStatusStore
{
    // Thread-safe dictionary to store client statuses, with the clientId as the key.
    private readonly ConcurrentDictionary<Guid, ClientStatusDto> ClientStore = new ConcurrentDictionary<Guid, ClientStatusDto>();

    // Adds or updates the client's status in the store.
    public Task AddOrUpdateStatusAsync(ClientStatusDto clientStatusDto)
    {
        // Set the last seen timestamp to the current time (UTC).
        clientStatusDto.LastSeen = DateTimeOffset.UtcNow;

        // Add or update the client status in the dictionary using clientId as the key.
        ClientStore.AddOrUpdate(
            clientStatusDto.ClientId,
            clientStatusDto,
            (_, existing) =>
            {
                // Update the existing client status.
                existing.ConnectionId = clientStatusDto.ConnectionId;
                existing.TenantId = clientStatusDto.TenantId;
                existing.ClientId = clientStatusDto.ClientId;
                existing.Type = clientStatusDto.Type;
                existing.Status = clientStatusDto.Status;
                existing.LastSeen = clientStatusDto.LastSeen;
                return existing;
            });

        return Task.CompletedTask;
    }

    // Removes a client from the store by its connection identifier (we'll update this to use clientId).
    public Task RemoveClientByConnectionAsync(string connectionId)
    {
        // Find the client by its connection ID.
        var clientToRemove = ClientStore.Values
            .FirstOrDefault(c => c.ConnectionId == connectionId);

        // If found, remove the client from the store.
        if (clientToRemove != null)
        {
            ClientStore.TryRemove(clientToRemove.ClientId, out _);
        }

        return Task.CompletedTask;
    }

    // Retrieves the status of a client by their client ID.
    public Task<ClientStatusDto?> GetStatusByConnectionIdAsync(string connectionId)
    {
        // Find the client by its connection ID.
        var client = ClientStore.Values
            .FirstOrDefault(c => c.ConnectionId == connectionId);

        // Return the client status by clientId if found.
        if (client != null && ClientStore.TryGetValue(client.ClientId, out var clientStatus))
        {
            return Task.FromResult<ClientStatusDto?>(clientStatus);
        }

        // Return null if no client found with the given connection ID.
        return Task.FromResult<ClientStatusDto?>(null);
    }
    
    // Retrieves the status of a client by their client ID.
    public Task<ClientStatusDto?> GetStatusByClientIdAsync(Guid clientId)
    {
        // Find the client by its client ID.
        if (ClientStore.TryGetValue(clientId, out var clientStatus))
        {
            // Return the client status if found.
            return Task.FromResult<ClientStatusDto?>(clientStatus);
        }

        // Return null if no client found with the given client ID.
        return Task.FromResult<ClientStatusDto?>(null);
    }

    // Retrieves a list of machine clients for a specific tenant.
    public Task<IEnumerable<ClientStatusDto>> GetMachineStatusesAsync(Guid tenantId)
    {
        var machines = ClientStore.Values
            .Where(w => w.TenantId == tenantId && w.Type == ClientTypesEnum.WorcMachine)
            .ToList();

        return Task.FromResult<IEnumerable<ClientStatusDto>>(machines);
    }

    // Retrieves a client based on the unique client identifier (clientId) for the WorcMachine type.
    public Task<ClientStatusDto?> GetClientByIdAsync(Guid clientId)
    {
        var machine = ClientStore.Values
            .FirstOrDefault(w => w.ClientId == clientId && w.Type == ClientTypesEnum.WorcMachine);

        return Task.FromResult<ClientStatusDto?>(machine);
    }

    // Retrieves a list of user clients for a specific tenant.
    public Task<IEnumerable<ClientStatusDto>> GetUserStatusesAsync(Guid tenantId)
    {
        var users = ClientStore.Values
            .Where(c => c.TenantId == tenantId &&
                (c.Type == ClientTypesEnum.WebBrowser || c.Type == ClientTypesEnum.WorcDesktopApp))
            .ToList();

        return Task.FromResult<IEnumerable<ClientStatusDto>>(users);
    }

    // Updates the status of a client by their clientId.
    public Task UpdateClientStatusAsync(ClientStatusDto clientStatusDto)
    {
        // Attempt to find and update the client's status by clientId.
        if (ClientStore.TryGetValue(clientStatusDto.ClientId, out var existingClient))
        {
            existingClient.Status = clientStatusDto.Status;
            existingClient.LastSeen = DateTimeOffset.UtcNow;
        }

        return Task.CompletedTask;
    }
}