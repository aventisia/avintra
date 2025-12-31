namespace WorkspaceAPIs.Features.CloudConnectors.Twilio;

[Route("cloud-connector/twilio")]
[ApiController]
[Authorize]
public class TwilioConnectorsController : BaseApiController
{
    private readonly ITwilioConnectorsService _twilioConnectorsService;
    public TwilioConnectorsController(ITwilioConnectorsService twilioConnectorsService)
    {
        _twilioConnectorsService = twilioConnectorsService;
    }

    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCloudConnector([FromBody] CloudConnectorReqDto cloudConnectorReqDto)
    {
        return ResultHelper(await _twilioConnectorsService.InvokeCloudConnectorAsync(cloudConnectorReqDto));
    }
}
