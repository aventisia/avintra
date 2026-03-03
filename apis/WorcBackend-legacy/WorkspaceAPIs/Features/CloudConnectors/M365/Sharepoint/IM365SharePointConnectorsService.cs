namespace WorkspaceAPIs.Features.CloudConnectors.M365.SharePoint;

public interface IM365SharePointConnectorsService
{
    /// <summary>
    /// Invokes a cloud connector (M365, OpenAI, SendGrid, etc.) with the given request.
    /// </summary>
    /// <param name="cloudConnectorReqDto">The request DTO for the cloud connector.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response.</returns>
    Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto);
}

