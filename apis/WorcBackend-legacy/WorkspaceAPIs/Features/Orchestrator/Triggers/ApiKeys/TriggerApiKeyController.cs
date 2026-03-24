/// <summary>
/// Controller for managing API keys used in trigger configurations.
/// </summary>
[Route("trigger/api-key")]
[ApiController]
[Authorize]
public class TriggerApiKeyController : BaseApiController
{
    private readonly ITriggerApiKeyService _triggerApiKeyService;

    public TriggerApiKeyController(ITriggerApiKeyService triggerApiKeyService)
    {
        _triggerApiKeyService = triggerApiKeyService;
    }

    // Generates a new API key for trigger usage.
    [HttpPost("generate")]
    public async Task<ActionResult<ServiceResponse<string>>> GenerateApiKey()
    {
        return ResultHelper(await _triggerApiKeyService.GenerateApiKeyAsync());
    }

    // Regenerates an API key for trigger usage.
    [HttpPost("regenerate")]
    public async Task<ActionResult<ServiceResponse<string>>> RegenerateApiKey()
    {
        return ResultHelper(await _triggerApiKeyService.RegenerateApiKeyAsync());
    }
}