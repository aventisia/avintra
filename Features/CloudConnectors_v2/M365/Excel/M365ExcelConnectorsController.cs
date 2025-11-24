namespace WorkspaceAPIs.Features.CloudConnectors.M365Excel;

[Route("cloud-connector/m365excel")]
[ApiController]
[Authorize]
public class M365ExcelConnectorsController : BaseApiController
{
    private readonly IM365ExcelConnectorsService _m365ExcelConnectorsService;
    public M365ExcelConnectorsController(IM365ExcelConnectorsService m365ExcelConnectorsService)
    {
        _m365ExcelConnectorsService = m365ExcelConnectorsService;
    }

    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCloudConnector([FromBody] CloudConnectorReqDto cloudConnectorReqDto)
    {
        return ResultHelper(await _m365ExcelConnectorsService.InvokeCloudConnectorAsync(cloudConnectorReqDto));
    }
}
