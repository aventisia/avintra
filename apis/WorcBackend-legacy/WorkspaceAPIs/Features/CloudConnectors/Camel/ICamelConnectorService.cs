using WorkspaceAPIs.Features.CloudConnectors;

namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Generic, configuration-driven Camel connector service contract. The single
/// <see cref="CamelConnectorService"/> implementation works for every connector
/// family by loading the connector config JSON and building the structured
/// harness request from each field's <c>camel</c> mapping.
/// </summary>
public interface ICamelConnectorService
{
    /// <summary>
    /// Invokes the Camel connector for the request.
    /// </summary>
    Task<ServiceResponse<CloudConnectorResDto>> InvokeAsync(CloudConnectorReqDto request);
}
