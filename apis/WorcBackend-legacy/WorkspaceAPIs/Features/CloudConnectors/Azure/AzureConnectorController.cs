namespace WorkspaceAPIs.Features.CloudConnectors.Azure;

[Route("cloud-connector/azure")]
[ApiController]
[Authorize]
public class AzureConnectorsController : BaseApiController
{
    private readonly IAzureConnectorsService _azureConnectorsService;
    public AzureConnectorsController(IAzureConnectorsService azureConnectorsService)
    {
        _azureConnectorsService = azureConnectorsService;
    }

    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCloudConnector([FromBody] CloudConnectorReqDto cloudConnectorReqDto)
    {
        return ResultHelper(await _azureConnectorsService.InvokeCloudConnectorAsync(cloudConnectorReqDto));
    }
}
