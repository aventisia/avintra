using System.Collections.Concurrent;

namespace WorkspaceAPIs.Services;

public class ClientStatusStore : IClientStatusStore
{
    // Thread-safe dictionary to store client statuses, with the connection ID as the key.
    private readonly ConcurrentDictionary<string, ClientStatusDto> ClientStore = new ConcurrentDictionary<string, ClientStatusDto>();

    // Adds or updates the client's status in the store.
    public Task AddOrUpdateStatusAsync(ClientStatusDto clientStatusDto)
    {
        // Set the last seen timestamp to the current time (UTC).
        clientStatusDto.LastSeen = DateTimeOffset.UtcNow;

        // Add or update the client status in the dictionary.
        ClientStore.AddOrUpdate(
            clientStatusDto.ConnectionId,
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

    // Removes a client from the store by its connection identifier.
    public Task RemoveClientByConnectionAsync(string connectionId)
    {
        // Attempt to remove the client using its connection ID.
        ClientStore.TryRemove(connectionId, out _);
        return Task.CompletedTask;
    }

    // Retrieves the status of a client by their connection ID.
    public Task<ClientStatusDto?> GetStatusByConnectionIdAsync(string connectionId)
    {
        // Try to get the client status by connection ID.
        if (ClientStore.TryGetValue(connectionId, out var clientStatus))
        {
            return Task.FromResult<ClientStatusDto?>(clientStatus);
        }

        // Return null if the client status doesn't exist.
        return Task.FromResult<ClientStatusDto?>(null);
    }

    // Retrieves a list of machine clients for a specific tenant.
    public Task<IEnumerable<ClientStatusDto>> GetMachineStatusesAsync(Guid tenantId)
    {
        var machines = ClientStore.Values
            .Where(c => c.TenantId == tenantId && c.Type == ClientTypesEnum.AssistAppMachine)
            .ToList();

        return Task.FromResult<IEnumerable<ClientStatusDto>>(machines);
    }

    // Retrieves a client based on the unique client identifier (clientId) for the AssistAppMachine type.
    public Task<ClientStatusDto?> GetClientByIdAsync(Guid clientId)
    {
        var machine = ClientStore.Values
            .FirstOrDefault(c => c.ClientId == clientId && c.Type == ClientTypesEnum.AssistAppMachine);

        // Return the result directly; if no machine is found, it will return null.
        return Task.FromResult<ClientStatusDto?>(machine);
    }

    // Retrieves a list of user clients for a specific tenant.
    public Task<IEnumerable<ClientStatusDto>> GetUserStatusesAsync(Guid tenantId)
    {
        var users = ClientStore.Values
            .Where(c => c.TenantId == tenantId &&
                (c.Type == ClientTypesEnum.WebBrowserUser || c.Type == ClientTypesEnum.DesktopAppUser))
            .ToList();

        return Task.FromResult<IEnumerable<ClientStatusDto>>(users);
    }

    // Updates the status of a client by their connection ID.
    public Task UpdateClientStatusAsync(ClientStatusDto clientStatusDto)
    {
        // Attempt to find and update the client's status by connection ID.
        if (ClientStore.TryGetValue(clientStatusDto.ConnectionId, out var existingClient))
        {
            existingClient.Status = clientStatusDto.Status;
            existingClient.LastSeen = DateTimeOffset.UtcNow;
        }

        return Task.CompletedTask;
    }
}