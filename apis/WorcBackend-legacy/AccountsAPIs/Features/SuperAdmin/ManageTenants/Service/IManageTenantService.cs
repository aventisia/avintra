namespace AccountsAPIs.Services;

public interface IManageTenantService
{
    /// <summary>
    /// Deletes a tenant identified by its ID, typically passed in the request headers.
    /// </summary>
    /// <returns>A task representing the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> indicating whether the deletion was successful.</returns>
    Task<ServiceResponse<bool>> DeleteTenantAsync();

    /// <summary>
    /// Gets the support configuration for a tenant.
    /// </summary>
    Task<ServiceResponse<TenantSupportConfigDto>> GetTenantSupportConfigAsync(Guid tenantId);

    /// <summary>
    /// Updates the support configuration for a tenant.
    /// </summary>
    Task<ServiceResponse<TenantSupportConfigDto>> UpdateTenantSupportConfigAsync(Guid tenantId, TenantSupportConfigDto configDto);
}
