namespace WorkspaceAPIs.Features.CloudConnectors.M365;

public interface IM365ConnectorsService
{
    Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto);
}