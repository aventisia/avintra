namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool;

public interface ICustomToolConnectorService
{
    /// <summary>
    /// Invokes a custom tool operation server-side.
    /// </summary>
    Task<ServiceResponse<CustomToolInvokeResDto>> InvokeAsync(
        CloudConnectorReqDto request,
        CancellationToken cancellationToken = default);
}
