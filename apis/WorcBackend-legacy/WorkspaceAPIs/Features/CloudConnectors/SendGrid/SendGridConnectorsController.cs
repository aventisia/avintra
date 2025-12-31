namespace WorkspaceAPIs.Features.CloudConnectors.SendGrid;

[Route("cloud-connector/sendgrid")]
[ApiController]
[Authorize]
public class SendGridConnectorsController : BaseApiController
{
    private readonly ISendGridConnectorsService _sendGridConnectorsService;
    public SendGridConnectorsController(ISendGridConnectorsService sendGridConnectorsService)
    {
        _sendGridConnectorsService = sendGridConnectorsService;
    }

    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCloudConnector([FromBody] CloudConnectorReqDto cloudConnectorReqDto)
    {
        return ResultHelper(await _sendGridConnectorsService.InvokeCloudConnectorAsync(cloudConnectorReqDto));
    }
}
