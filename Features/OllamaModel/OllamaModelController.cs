namespace WorkspaceAPIs.Controllers;

[Route("ollama-model")]
[ApiController]
[Authorize(Roles = "SA")]
public class OllamaModelController : BaseApiController
{
    private readonly IOllamaModelService _ollamaModelService;

    public OllamaModelController(IOllamaModelService ollamaModelService)
    {
        _ollamaModelService = ollamaModelService;
    }

    // Checks the availability of an Ollama model name.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsModelNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _ollamaModelService.IsOllamaModelNameAvailableAsync(checkAvailabilityDto));
    }

    // Fetch all Ollama models
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<OllamaModelDto>>>> GetAllOllamaModels()
    {
        return ResultHelper(await _ollamaModelService.GetAllOllamaModelsAsync());
    }

    // Fetch Ollama model by its ID
    [HttpGet("{ollamaModelId}")]
    public async Task<ActionResult<ServiceResponse<OllamaModelDto>>> GetOllamaModel(Guid ollamaModelId)
    {
        return ResultHelper(await _ollamaModelService.GetOllamaModelAsync(ollamaModelId));
    }

    // Fetch Ollama model by its name
    [HttpGet("name/{ollamaModelName}")]
    public async Task<ActionResult<ServiceResponse<OllamaModelDto>>> GetOllamaModelByName(string ollamaModelName)
    {
        return ResultHelper(await _ollamaModelService.GetOllamaModelByNameAsync(ollamaModelName));
    }

    // Create a new Ollama model
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<OllamaModelDto>>> InsertOllamaModel([FromBody] OllamaModelDto ollamaModelDto)
    {
        return ResultHelper(await _ollamaModelService.InsertOllamaModelAsync(ollamaModelDto));
    }

    // Update an existing Ollama model
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<OllamaModelDto>>> UpdateOllamaModel([FromBody] OllamaModelDto ollamaModelDto)
    {
        return ResultHelper(await _ollamaModelService.UpdateOllamaModelAsync(ollamaModelDto));
    }

    // Delete an Ollama model by ID
    [HttpDelete("{ollamaModelId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteOllamaModel(Guid ollamaModelId)
    {
        return ResultHelper(await _ollamaModelService.DeleteOllamaModelAsync(ollamaModelId));
    }

    // Delete multiple Ollama models by IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleOllamaModels([FromBody] IEnumerable<Guid> ollamaModelIds)
    {
        return ResultHelper(await _ollamaModelService.DeleteMultipleOllamaModelsAsync(ollamaModelIds));
    }

    // Search Ollama models by name
    [HttpGet("search/{modelName}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<OllamaModelDto>>>> GetAllOllamaModels(string modelName)
    {
        return ResultHelper(await _ollamaModelService.SearchOllamaModelsByNameAsync(modelName));
    }
}
