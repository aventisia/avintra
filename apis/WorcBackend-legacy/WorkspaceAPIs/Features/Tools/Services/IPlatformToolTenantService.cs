namespace WorkspaceAPIs.Services;

/// <summary>
/// Maintains the per-tenant set of enabled library tools.
/// </summary>
public interface IPlatformToolTenantService
{
    /// <summary>
    /// Returns the platform tool identifiers enabled for the current tenant.
    /// </summary>
    Task<IReadOnlySet<Guid>> GetEnabledToolIdsAsync();

    /// <summary>
    /// Indicates whether the current tenant has enabled the given platform tool.
    /// </summary>
    Task<bool> IsEnabledAsync(Guid platformToolId);

    /// <summary>
    /// Maps the popular library tools to the current tenant when it has no mapping rows yet.
    /// </summary>
    Task EnsureCurrentTenantMaterializedAsync();
}
