namespace WorkspaceAPIs.Features.CloudConnectors.M365;

public interface IM365ConnectorsService
{
    string GRAPH_BASE_URL { get; }

    Task<string?> GetM365AccessTokenAsync(string credentialName);

    /// <summary>
    /// Resolves an M365 access token together with the exact reason when the credential cannot be used.
    /// </summary>
    /// <param name="credentialName">The name of the M365 credential.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the access token or the failure message.</returns>
    Task<(string? AccessToken, string? Failure)> TryGetM365AccessTokenAsync(string credentialName);

    Task<JsonDocument> GetDriveAndItemIdAsync(string accessToken, string fileUrl);

    Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto cloudConnectorReqDto);
}