namespace WorkspaceAPIs.Features.CloudConnectors.M365;

public interface IM365ConnectorsService
{
    string GRAPH_BASE_URL { get; }

    Task<string?> GetM365AccessTokenAsync(string credentialName);

    Task<JsonDocument> GetDriveAndItemIdAsync(string accessToken, string fileUrl);

    Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto);
}