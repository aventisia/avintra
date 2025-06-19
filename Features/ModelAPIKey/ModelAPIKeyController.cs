namespace MLModelBuilderAPIs.Controllers;

[Route("api-keys")]
[ApiController]
[Authorize]
public class ModelAPIKeyController : BaseApiController
{
    private readonly IModelAPIKeyService _modelAPIKeyService;

    public ModelAPIKeyController(IModelAPIKeyService modelAPIKeyService)
    {
        _modelAPIKeyService = modelAPIKeyService;
    }

    // Retrieves a list of API keys for the authenticated user
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ModelAPIKeyDto>>>> GetAPIKeys()
    {
        return ResultHelper(await _modelAPIKeyService.GetAPIKeysAsync());
    }

    // Creates a new API key
    [HttpPost("generate")]
    public async Task<ActionResult<ServiceResponse<ModelAPIKeyDto>>> GenerateAPIKey(ModelAPIKeyDto apiKeyDto)
    {
        return ResultHelper(await _modelAPIKeyService.GenerateAPIKeyAsync(apiKeyDto));
    }

    // Deletes a specific API key by its ID
    [HttpDelete("{modelAPiKeyId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAPIKey(Guid modelAPiKeyId)
    {
        return ResultHelper(await _modelAPIKeyService.DeleteAPIKeyAsync(modelAPiKeyId));
    }

    // Retrieves a specific API key by its ID
    [HttpGet("{modelAPiKeyId}")]
    public async Task<ActionResult<ServiceResponse<ModelAPIKeyDto>>> GetAPIKeyById(Guid modelAPiKeyId)
    {
        return ResultHelper(await _modelAPIKeyService.GetAPIKeyByIdAsync(modelAPiKeyId));
    }

    // Deletes multiple API keys by their IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleAPIKeys([FromBody] List<Guid> modelAPiKeyIds)
    {
        return ResultHelper(await _modelAPIKeyService.DeleteMultipleAPIKeysAsync(modelAPiKeyIds));
    }

    // Gets models using API key IDs from header
    [HttpGet("ml-models")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ModelByAPIKeyDto>>>> GetModelsByApiKeys()
    {
        return ResultHelper(await _modelAPIKeyService.GetModelByApiKeyAsync());
    }
}
