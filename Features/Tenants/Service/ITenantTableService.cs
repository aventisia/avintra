namespace WorkspaceAPIs.Services;

public interface ITenantTableService
{
    /// <summary>
    /// Deletes a tenant by its ID.
    /// </summary>
    /// <param name="id">The ID of the tenant to delete.</param>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteTenantAsync(Guid id);
}