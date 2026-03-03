namespace WorkspaceAPIs.Features.CloudConnectors.M365.SharePoint;

[Route("cloud-connector/m365/sharepoint")]
[ApiController]
[Authorize]
public class M365SharePointConnectorsController : BaseApiController
{
    private readonly IM365SharePointConnectorsService _m365ExcelConnectorsService;
    public M365SharePointConnectorsController(IM365SharePointConnectorsService m365ExcelConnectorsService)
    {
        _m365ExcelConnectorsService = m365ExcelConnectorsService;
    }

    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCloudConnector([FromBody] CloudConnectorReqDto cloudConnectorReqDto)
    {
        return ResultHelper(await _m365ExcelConnectorsService.InvokeCloudConnectorAsync(cloudConnectorReqDto));
    }
}
