namespace WorkspaceAPIs.Features.CloudConnectors.M365.Outlook;

[Route("cloud-connector/m365/outlook")]
[ApiController]
[Authorize]
public class M365OutlookConnectorsController : BaseApiController
{
    private readonly IM365OutlookConnectorsService _m365ExcelConnectorsService;
    public M365OutlookConnectorsController(IM365OutlookConnectorsService m365ExcelConnectorsService)
    {
        _m365ExcelConnectorsService = m365ExcelConnectorsService;
    }

    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCloudConnector([FromBody] CloudConnectorReqDto cloudConnectorReqDto)
    {
        return ResultHelper(await _m365ExcelConnectorsService.InvokeCloudConnectorAsync(cloudConnectorReqDto));
    }
}
