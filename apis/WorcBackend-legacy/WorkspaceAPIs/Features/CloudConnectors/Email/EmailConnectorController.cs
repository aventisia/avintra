namespace WorkspaceAPIs.Features.CloudConnectors.Email;

[Route("cloud-connector/email")]
[ApiController]
[Authorize]
public class EmailConnectorsController : BaseApiController
{
    private readonly IEmailConnectorsService _emailConnectorsService;
    public EmailConnectorsController(IEmailConnectorsService emailConnectorsService)
    {
        _emailConnectorsService = emailConnectorsService;
    }

    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCloudConnector([FromBody] CloudConnectorReqDto cloudConnectorReqDto)
    {
        return ResultHelper(await _emailConnectorsService.InvokeCloudConnectorAsync(cloudConnectorReqDto));
    }
}
