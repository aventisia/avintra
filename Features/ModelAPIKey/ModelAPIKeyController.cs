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

    // Retrieves all API keys linked to the specified machine learning model for the current user
    [HttpGet("list/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ModelAPIKeyDto>>>> GetAPIKeysByModelId(Guid mlModelId)
    {
        return ResultHelper(await _modelAPIKeyService.GetAPIKeysByModelIdAsync(mlModelId));
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
}
