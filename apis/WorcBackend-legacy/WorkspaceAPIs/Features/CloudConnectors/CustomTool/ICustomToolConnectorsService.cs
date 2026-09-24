namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool;

public interface ICustomToolConnectorService
{
    /// <summary>
    /// Invokes a custom tool operation server-side.
    /// </summary>
    /// <param name="request">The connector request whose action carries the <c>{toolName}.{operationId}</c> reference (legacy <c>{toolId}.{operationId}</c> is still accepted).</param>
    /// <returns>The upstream API response wrapped in a service response.</returns>
    Task<ServiceResponse<CloudConnectorResDto>> InvokeAsync(CloudConnectorReqDto request);
}