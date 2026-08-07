namespace WorkspaceAPIs.Services;

/// <summary>
/// Defines the contract for managing tenant-scoped model provider configurations.
/// </summary>
public interface ITenantModelProviderService
{
    /// <summary>
    /// Retrieves all model provider configurations for the current tenant.
    /// </summary>
    Task<ServiceResponse<IEnumerable<TenantModelProviderDto>>> GetAllModelProvidersAsync();

    /// <summary>
    /// Retrieves a model provider configuration by its identifier.
    /// </summary>
    Task<ServiceResponse<TenantModelProviderDto>> GetModelProviderByIdAsync(Guid modelProviderId);

    /// <summary>
    /// Creates or updates a model provider configuration for the current tenant.
    /// </summary>
    Task<ServiceResponse<TenantModelProviderDto>> UpsertModelProviderAsync(TenantModelProviderDto modelProviderDto);

    /// <summary>
    /// Deletes a model provider configuration by its identifier.
    /// </summary>
    Task<ServiceResponse<bool>> DeleteModelProviderAsync(Guid modelProviderId);
}
