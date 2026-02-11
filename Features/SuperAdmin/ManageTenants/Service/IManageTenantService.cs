namespace AccountsAPIs.Services;

public interface IManageTenantService
{
    /// <summary>
    /// Deletes a tenant identified by its ID, typically passed in the request headers.
    /// </summary>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteTenantAsync();
}
