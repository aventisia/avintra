namespace WorkspaceAPIs.Features.CloudConnectors.VectorStore;

public interface IVectorConnectorsService
{
    /// <summary>
    /// Invoke vector store operations (insert, search, delete, etc.)
    /// </summary>
    /// <param name="cloudConnectorReqDto">The request DTO for the cloud connector.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the service response.</returns>
    Task<ServiceResponse<CloudConnectorResDto>> InvokeCloudConnectorAsync(CloudConnectorReqDto req);
}