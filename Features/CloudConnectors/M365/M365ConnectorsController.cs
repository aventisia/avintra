namespace WorkspaceAPIs.Features.CloudConnectors.M365;

[Route("api/cloud-connector/m365")]
[ApiController]
[Authorize]
public class M365ConnectorsController : BaseApiController
{
    private readonly IM365ConnectorsService _m365ConnectorsService;
    public M365ConnectorsController(IM365ConnectorsService m365ConnectorsService)
    {
        _m365ConnectorsService = m365ConnectorsService;
    }

    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCloudConnector([FromBody] CloudConnectorReqDto cloudConnectorReqDto)
    {
        return ResultHelper(await _m365ConnectorsService.InvokeCloudConnectorAsync(cloudConnectorReqDto));
    }
}
