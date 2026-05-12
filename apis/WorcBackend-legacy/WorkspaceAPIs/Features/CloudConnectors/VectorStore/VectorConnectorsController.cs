using WorkspaceAPIs.Features.CloudConnectors.VectorStore;

namespace WorkspaceAPIs.Features.CloudConnectors.VectorStore.Postgres;

[Route("cloud-connector/vectorstore")]
[ApiController]
public class VectorConnectorsController : BaseApiController
{
    private readonly IVectorConnectorsService _vectorService;

    public VectorConnectorsController(IVectorConnectorsService vectorService)
    {
        _vectorService = vectorService;
    }

    /// <summary>
    /// Executes a vector store cloud connector operation (upsert, search, etc.)
    /// </summary>
    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeAsync([FromBody] CloudConnectorReqDto request)
    {
        return ResultHelper(await _vectorService.InvokeCloudConnectorAsync(request));
    }
}