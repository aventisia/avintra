namespace MLModelBuilderAPIs.Controllers;

[Route("api-keys")]
[ApiController]
[Authorize]
public class AIProjectVersionApiKeyController : BaseApiController
{
    private readonly IAIProjectVersionApiKeyService _aiProjectVersionApiKeyService;

    public AIProjectVersionApiKeyController(IAIProjectVersionApiKeyService aiProjectVersionApiKeyService)
    {
        _aiProjectVersionApiKeyService = aiProjectVersionApiKeyService;
    }

    // Retrieves all Api keys associated with the specified AI project version for the current user.
    [HttpGet("list/{aiProjectVersionId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIProjectVersionApiKeyDto>>>> GetApiKeysByAIProjectVersionId(Guid aiProjectVersionId)
    {
        return ResultHelper(await _aiProjectVersionApiKeyService.GetApiKeysByAIProjectVersionIdAsync(aiProjectVersionId));
    }

    // Generates a new Api key for the specified AI project.
    [HttpPost("generate")]
    public async Task<ActionResult<ServiceResponse<AIProjectVersionApiKeyDto>>> GenerateApiKey(AIProjectVersionApiKeyDto aiProjectVersionApiKeyDto)
    {
        return ResultHelper(await _aiProjectVersionApiKeyService.GenerateApiKeyAsync(aiProjectVersionApiKeyDto));
    }

    // Updates an existing Api key associated with an AI project.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AIProjectVersionApiKeyDto>>> UpdateApiKey(AIProjectVersionApiKeyDto aiProjectVersionApiKeyDto)
    {
        return ResultHelper(await _aiProjectVersionApiKeyService.UpdateApiKeyAsync(aiProjectVersionApiKeyDto));
    }

    // Deletes an Api key by its unique identifier.
    [HttpDelete("{aiProjectApiKeyId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteApiKey(Guid aiProjectApiKeyId)
    {
        return ResultHelper(await _aiProjectVersionApiKeyService.DeleteApiKeyAsync(aiProjectApiKeyId));
    }

    // Retrieves a specific Api key by its unique identifier.
    [HttpGet("{aiProjectApiKeyId}")]
    public async Task<ActionResult<ServiceResponse<AIProjectVersionApiKeyDto>>> GetApiKeyById(Guid aiProjectApiKeyId)
    {
        return ResultHelper(await _aiProjectVersionApiKeyService.GetApiKeyByIdAsync(aiProjectApiKeyId));
    }

    // Deletes multiple Api keys using a list of their unique identifiers.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleApiKeys([FromBody] List<Guid> aiProjectApiKeyIds)
    {
        return ResultHelper(await _aiProjectVersionApiKeyService.DeleteMultipleApiKeysAsync(aiProjectApiKeyIds));
    }
}
