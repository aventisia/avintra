namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides read access to the tool catalogue available to the current user.
/// </summary>
public interface IToolCatalogService
{
    /// <summary>
    /// Gets the platform, personal, shared and tenant-wide tools the current user can use.
    /// </summary>
    Task<ServiceResponse<IEnumerable<UsableToolDto>>> GetUsableToolsAsync();

    /// <summary>
    /// Gets the operations exposed by a usable tool, together with the credential type required to invoke it.
    /// </summary>
    Task<ServiceResponse<UsableToolOperationsDto>> GetUsableToolOperationsAsync(Guid toolId);

    /// <summary>
    /// Gets the usable tools together with their enriched operations in a single payload.
    /// </summary>
    Task<ServiceResponse<IEnumerable<UsableToolCatalogItemDto>>> GetUsableToolCatalogAsync();

    /// <summary>
    /// Gets all platform's default tools available to the current tenant.
    /// </summary>
    Task<ServiceResponse<IEnumerable<ToolDto>>> GetPlatformToolsAsync();
}
