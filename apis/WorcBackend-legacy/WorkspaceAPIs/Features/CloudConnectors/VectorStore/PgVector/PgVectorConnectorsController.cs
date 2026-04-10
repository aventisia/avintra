using WorkspaceAPIs.Features.CloudConnectors.VectorStore.PgVector;

namespace WorkspaceAPIs.Features.CloudConnectors.VectorStore.Postgres;

[Route("cloud-connector/vector-store/pgvector")]
[ApiController]
public class PgVectorConnectorsController : BaseApiController
{
    private readonly IPgVectorConnectorsService _pgVectorService;

    public PgVectorConnectorsController(IPgVectorConnectorsService pgVectorService)
    {
        _pgVectorService = pgVectorService;
    }

    /// <summary>
    /// Executes a pgvector cloud connector operation (upsert, search, etc.)
    /// </summary>
    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeAsync([FromBody] CloudConnectorReqDto request)
    {
        return ResultHelper(await _pgVectorService.InvokeCloudConnectorAsync(request));
    }
}