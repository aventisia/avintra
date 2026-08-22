namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides methods for managing and retrieving the status of connected clients within the system.
/// </summary>
public interface IClientStatusStore
{
    /// <summary>
    /// Adds or updates the status of a client in the system.
    /// If the client already exists, their status will be updated; otherwise, a new status will be created.
    /// </summary>
    /// <param name="clientDataStore">The client status to be added or updated.</param>
    Task AddOrUpdateStatusAsync(ClientDataStore clientDataStore);

    /// <summary>
    /// Removes a client from the connection store using their connection identifier.
    /// This action disconnects the client and removes their associated status.
    /// </summary>
    /// <param name="connectionId">The connection identifier of the client to be removed.</param>
    Task RemoveClientByConnectionAsync(string connectionId);

    /// <summary>
    /// Retrieves the status of a client based on their connection identifier.
    /// Returns the client's status information or null if no status is found.
    /// </summary>
    /// <param name="connectionId">The connection identifier of the client whose status is being queried.</param>
    /// <returns>A task representing the asynchronous operation, containing the client status or null.</returns>
    Task<ClientDataStore?> GetStatusByConnectionIdAsync(string connectionId);

    /// <summary>
    /// Retrieves the status of a client based on their unique client identifier.
    /// This method returns the client's status information or null if no status is found for the provided client ID.
    /// </summary>
    /// <param name="clientId">The unique identifier of the client whose status is being queried.</param>
    /// <returns>A task representing the asynchronous operation, containing the client's status (as a <see cref="ClientStatusDto"/>) or null if no status is found.</returns>
    Task<ClientDataStore?> GetStatusByClientIdAsync(Guid clientId);

    /// <summary>
    /// Retrieves the status information of a client based on their unique client identifier.
    /// Returns the client's status details or null if no status is found for the provided client ID.
    /// </summary>
    /// <param name="clientId">The unique client identifier of the client whose status is being retrieved.</param>
    /// <returns>A task representing the asynchronous operation, containing the client's status details or null if no status is available for the given client ID.</returns>
    Task<ClientDataStore?> GetClientByIdAsync(Guid clientId);

    /// <summary>
    /// Retrieves a list of machine status entries for a specific tenant.
    /// This can be used to track the operational state of machines under a tenant's account.
    /// </summary>
    /// <param name="tenantId">The identifier of the tenant whose machine statuses are being retrieved.</param>
    /// <returns>A task representing the asynchronous operation, containing a list of machine status entries.</returns>
    Task<IEnumerable<ClientDataStore>> GetMachineStatusesAsync(Guid tenantId);

    /// <summary>
    /// Retrieves a list of user status entries for a specific tenant.
    /// This can be used to track the operational state of users under a tenant's account.
    /// </summary>
    /// <param name="tenantId">The identifier of the tenant whose user statuses are being retrieved.</param>
    /// <returns>A task representing the asynchronous operation, containing a list of user status entries.</returns>
    Task<IEnumerable<ClientDataStore>> GetUserStatusesAsync(Guid tenantId);

    /// <summary>
    /// Updates the operational status of a client in the system.
    /// This method ensures that the client's status information is kept current.
    /// </summary>
    /// <param name="clientDataStore">The client status with the updated information to be applied.</param>
    Task UpdateClientStatusAsync(ClientDataStore clientDataStore);

    /// <summary>
    /// Retrieves the status of a client based on the associated job identifier.
    /// </summary>
    /// <param name="jobId">The unique identifier of the job associated with the client.</param>
    /// <returns> A task representing the asynchronous operation, containing the client's status information, or null if no client is associated with the specified job ID.  </returns>
    Task<ClientDataStore?> GetStatusByJobIdAsync(Guid jobId);

    /// <summary>
    /// Retrieves a snapshot of all currently online client presence entries for a tenant.
    /// Used so a newly connected client can learn who is already online without receiving
    /// its own connect event.
    /// </summary>
    /// <param name="tenantId">The identifier of the tenant whose presence snapshot is being retrieved.</param>
    /// <returns>A task representing the asynchronous operation, containing the presence entries of all online clients for the tenant.</returns>
    Task<IEnumerable<ClientDataStore>> GetPresenceAsync(Guid tenantId);

    /// <summary>
    /// Retrieves a machine client by its unique name (e.g. <c>[username]_os_osid</c>) within a tenant.
    /// Used to resolve a machine identified by name (hub/websocket) to its internal store entry.
    /// </summary>
    /// <param name="tenantId">The identifier of the tenant.</param>
    /// <param name="clientName">The unique machine name.</param>
    /// <returns>The client status for the matching machine, or null if not found.</returns>
    Task<ClientDataStore?> GetClientByNameAsync(Guid tenantId, string clientName);
}