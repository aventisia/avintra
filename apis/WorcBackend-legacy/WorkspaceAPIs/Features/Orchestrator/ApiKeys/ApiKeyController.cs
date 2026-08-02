namespace WorkspaceAPIs.Controllers;

[Route("api-keys")]
[ApiController]
[Authorize(Roles = "OM")]
public class ApiKeyController : BaseApiController
{
    private readonly IApiKeyService _apiKeyService;

    public ApiKeyController(IApiKeyService apiKeyService)
    {
        _apiKeyService = apiKeyService;
    }

    // Retrieves list of API keys.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ApiKeyDto>>>> GetApiKeys()
        => ResultHelper(await _apiKeyService.GetApiKeysAsync());

    // Retrieves an API key by its ID.
    [HttpGet("{apiKeyId}")]
    public async Task<ActionResult<ServiceResponse<ApiKeyDto>>> GetApiKey(Guid apiKeyId)
        => ResultHelper(await _apiKeyService.GetApiKeyAsync(apiKeyId));

    // Creates a new API key.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<CreateApiKeyResDto>>> CreateApiKey([FromBody] CreateApiKeyReqDto createApiKeyReqDto)
        => ResultHelper(await _apiKeyService.CreateApiKeyAsync(createApiKeyReqDto));

    // Updates an existing API key.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ApiKeyDto>>> UpdateApiKey([FromBody] UpdateApiKeyDto updateApiKeyDto)
        => ResultHelper(await _apiKeyService.UpdateApiKeyAsync(updateApiKeyDto));

    // Deletes an existing API key.
    [HttpDelete("{apiKeyId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteApiKey(Guid apiKeyId)
        => ResultHelper(await _apiKeyService.DeleteApiKeyAsync(apiKeyId));

    // Deletes multiple API keys by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<int>>> DeleteMultipleApiKeys([FromBody] IEnumerable<Guid> ids)
        => ResultHelper(await _apiKeyService.DeleteMultipleApiKeysAsync(ids));
}
