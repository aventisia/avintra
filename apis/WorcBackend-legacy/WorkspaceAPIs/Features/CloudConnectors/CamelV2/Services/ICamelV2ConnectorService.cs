using WorkspaceAPIs.Features.CloudConnectors.CamelV2.Models;

namespace WorkspaceAPIs.Features.CloudConnectors.CamelV2.Services;

/// <summary>
/// Contract for the generic, catalog-driven CamelV2 connector service.
/// </summary>
public interface ICamelV2ConnectorService
{
    /// <summary>
    /// Invokes a Camel connector for the request. Prefers the config-driven path
    /// (delegating to <see cref="CamelConnectorService"/>), falling back to a
    /// schema-driven invocation for catalog components without a config file.
    /// </summary>
    Task<ServiceResponse<CloudConnectorResDto>> InvokeAsync(CloudConnectorReqDto request);

    /// <summary>
    /// Returns the full connector catalog (connector name → schema) from the
    /// harness.
    /// </summary>
    Task<IReadOnlyDictionary<string, CamelV2ConnectorSchema>> GetCatalogAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the supported operations for a connector, or an empty list when
    /// the schema has no operation enum.
    /// </summary>
    Task<IReadOnlyList<string>> GetOperationsAsync(
        string connector,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Re-fetches the catalog, re-seeds <c>ws_Tools</c>, and regenerates the
    /// connector node config files. Returns the number of node configs generated.
    /// </summary>
    Task<int> RefreshAsync(
        WorkspaceDbContext dbContext,
        Guid tenantId,
        Guid userId,
        CancellationToken cancellationToken = default);
}
