namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Invokes Apache Camel connector families (http, sql, jdbc, file, ftp, jms,
/// kafka, mail, github, m365) through the internal Camel connector harness
/// (Spring Boot, port 4005). Mirrors the existing cloud-connector contract:
/// <c>POST /cloud-connector/camel/{family}/invoke</c> with the unified
/// <see cref="CloudConnectorReqDto"/>.
/// </summary>
public interface ICamelConnectorsService
{
    /// <summary>
    /// Invokes a Camel connector with the given request, proxying to the Camel harness.
    /// </summary>
    /// <param name="cloudConnectorReqDto">The request DTO (Provider = "Camel/&lt;Family&gt;").</param>
    /// <returns>A task that represents the asynchronous operation.</returns>
    Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto);
}
