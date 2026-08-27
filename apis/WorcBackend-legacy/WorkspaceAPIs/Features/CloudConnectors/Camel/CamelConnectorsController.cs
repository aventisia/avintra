namespace WorkspaceAPIs.Features.CloudConnectors.Camel;

/// <summary>
/// Exposes Apache Camel connector families to the Workspace canvas + desktop as
/// standard cloud-connector nodes. The route family is the last segment of the
/// provider ("Camel/Github" -> family "github"); nodes invoke through the Camel
/// harness. The frontend contract is identical to existing cloud connectors:
/// <c>POST /cloud-connector/camel/{family}/invoke</c>.
/// </summary>
[Route("cloud-connector/camel")]
[ApiController]
[Authorize]
public class CamelConnectorsController : BaseApiController
{
    private readonly ICamelConnectorsService _camelConnectorsService;

    public CamelConnectorsController(ICamelConnectorsService camelConnectorsService)
    {
        _camelConnectorsService = camelConnectorsService;
    }

    [HttpPost("{family}/invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCloudConnector(
        string family,
        [FromBody] CloudConnectorReqDto cloudConnectorReqDto)
    {
        return ResultHelper(await _camelConnectorsService.InvokeCloudConnectorAsync(cloudConnectorReqDto));
    }
}
