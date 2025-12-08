namespace WorkspaceAPIs.Features.CloudConnectors.LLMProvider;

[Route("cloud-connector/llmprovider")]
[ApiController]
[Authorize]
public class LLMProviderConnectorsController : BaseApiController
{
    private readonly ILLMProviderConnectorsService _llmproviderConnectorsService;
    public LLMProviderConnectorsController(ILLMProviderConnectorsService llmproviderConnectorsService)
    {
        _llmproviderConnectorsService = llmproviderConnectorsService;
    }

    [HttpPost("invoke")]
    public async Task<ActionResult<ServiceResponse<CloudConnectorResDto>>> InvokeCloudConnector([FromBody] CloudConnectorReqDto cloudConnectorReqDto)
    {
        return ResultHelper(await _llmproviderConnectorsService.InvokeCloudConnectorAsync(cloudConnectorReqDto));
    }
}
