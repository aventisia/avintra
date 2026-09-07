using WorkspaceAPIs.Features.CloudConnectors.Camel.Models;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel.Services;

/// <summary>
/// Contract for the single, generic Apache Camel connector service.
///
/// The implementation works for every connector family in the harness catalog:
/// invocation prefers the generated config file under
/// <c>ConfigFiles/Camel/&lt;Family&gt;/&lt;Action&gt;Connector.json</c> (the single
/// source of truth) and falls back to a schema-driven invocation for catalog
/// components without a config file.
/// </summary>
public interface ICamelConnectorService
{
    /// <summary>
    /// Invokes a Camel connector for the request. The connector family is
    /// resolved from <c>Provider</c>, the action from <c>Action</c>.
    /// </summary>
    Task<ServiceResponse<CloudConnectorResDto>> InvokeAsync(CloudConnectorReqDto request);

    /// <summary>
    /// Returns the full connector catalog (connector name → schema) from the
    /// harness.
    /// </summary>
    Task<IReadOnlyDictionary<string, CamelConnectorSchema>> GetCatalogAsync(
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the supported operations for a connector, or an empty list when
    /// the schema has no operation enum.
    /// </summary>
    Task<IReadOnlyList<string>> GetOperationsAsync(
        string connector,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Re-fetches the catalog from the harness. Returns the number of connectors
    /// in the refreshed catalog.
    /// </summary>
    Task<int> RefreshCatalogAsync(CancellationToken cancellationToken = default);
}
