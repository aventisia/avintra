namespace MLModelBuilderAPIs.Controllers;

[Route("api-keys")]
[ApiController]
[Authorize]
public class AIProjectApiKeyController : BaseApiController
{
    private readonly IAIProjectApiKeyService _aiProjectApiKeyService;

    public AIProjectApiKeyController(IAIProjectApiKeyService aiProjectApiKeyService)
    {
        _aiProjectApiKeyService = aiProjectApiKeyService;
    }

    // Retrieves all Api keys associated with the specified AI project version for the current user.
    [HttpGet("list/{aiProjectVersionId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIProjectApiKeyDto>>>> GetApiKeysByAIProjectVersionId(Guid aiProjectVersionId)
    {
        return ResultHelper(await _aiProjectApiKeyService.GetApiKeysByAIProjectIdAsync(aiProjectVersionId));
    }

    // Generates a new Api key for the specified AI project.
    [HttpPost("generate")]
    public async Task<ActionResult<ServiceResponse<AIProjectApiKeyDto>>> GenerateApiKey(AIProjectApiKeyDto aiProjectApiKeyDto)
    {
        return ResultHelper(await _aiProjectApiKeyService.GenerateApiKeyAsync(aiProjectApiKeyDto));
    }

    // Updates an existing Api key associated with an AI project.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AIProjectApiKeyDto>>> UpdateApiKey(AIProjectApiKeyDto aiProjectApiKeyDto)
    {
        return ResultHelper(await _aiProjectApiKeyService.UpdateApiKeyAsync(aiProjectApiKeyDto));
    }

    // Deletes an Api key by its unique identifier.
    [HttpDelete("{aiProjectApiKeyId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteApiKey(Guid aiProjectApiKeyId)
    {
        return ResultHelper(await _aiProjectApiKeyService.DeleteApiKeyAsync(aiProjectApiKeyId));
    }

    // Retrieves a specific Api key by its unique identifier.
    [HttpGet("{aiProjectApiKeyId}")]
    public async Task<ActionResult<ServiceResponse<AIProjectApiKeyDto>>> GetApiKeyById(Guid aiProjectApiKeyId)
    {
        return ResultHelper(await _aiProjectApiKeyService.GetApiKeyByIdAsync(aiProjectApiKeyId));
    }

    // Deletes multiple Api keys using a list of their unique identifiers.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleApiKeys([FromBody] List<Guid> aiProjectApiKeyIds)
    {
        return ResultHelper(await _aiProjectApiKeyService.DeleteMultipleApiKeysAsync(aiProjectApiKeyIds));
    }
}
