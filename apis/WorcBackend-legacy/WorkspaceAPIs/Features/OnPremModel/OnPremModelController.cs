namespace WorkspaceAPIs.Controllers;

[Authorize(Roles = "TA")]
[Route("onprem-model")]
[ApiController]
public class OnPremModelController : BaseApiController
{
    private readonly IOnPremModelService _onPremModelService;

    public OnPremModelController(IOnPremModelService onPremModelService)
    {
        _onPremModelService = onPremModelService;
    }

    // Checks the availability of an OnPrem model name.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsModelNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _onPremModelService.IsOnPremModelNameAvailableAsync(checkAvailabilityDto));
    }

    // Fetch all OnPrem models
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<OnPremModelDto>>>> GetAllOnPremModels()
    {
        return ResultHelper(await _onPremModelService.GetAllOnPremModelsAsync());
    }

    // Fetch available Ollama models from the given provider URL
    [HttpGet("ollama/models")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<OllamaModelDto>>>> GetOllamaModels([FromQuery] string providerUrl)
    {
        return ResultHelper(await _onPremModelService.GetOllamaModelsAsync(providerUrl));
    }

    // Fetch OnPrem model by its ID
    [HttpGet("{onPremModelId}")]
    public async Task<ActionResult<ServiceResponse<OnPremModelDto>>> GetOnPremModel(Guid onPremModelId)
    {
        return ResultHelper(await _onPremModelService.GetOnPremModelAsync(onPremModelId));
    }

    // Fetch OnPrem model by its name
    [HttpGet("name/{onPremModelName}")]
    public async Task<ActionResult<ServiceResponse<OnPremModelDto>>> GetOnPremModelByName(string onPremModelName)
    {
        return ResultHelper(await _onPremModelService.GetOnPremModelByNameAsync(onPremModelName));
    }

    // Create a new OnPrem model
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<OnPremModelDto>>> InsertOnPremModel([FromBody] OnPremModelDto onPremModelDto)
    {
        return ResultHelper(await _onPremModelService.InsertOnPremModelAsync(onPremModelDto));
    }

    // Update an existing OnPrem model
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<OnPremModelDto>>> UpdateOnPremModel([FromBody] OnPremModelDto onPremModelDto)
    {
        return ResultHelper(await _onPremModelService.UpdateOnPremModelAsync(onPremModelDto));
    }

    // Delete an OnPrem model by ID
    [HttpDelete("{onPremModelId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteOnPremModel(Guid onPremModelId)
    {
        return ResultHelper(await _onPremModelService.DeleteOnPremModelAsync(onPremModelId));
    }

    // Delete multiple OnPrem models by IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleOnPremModels([FromBody] IEnumerable<Guid> onPremModelIds)
    {
        return ResultHelper(await _onPremModelService.DeleteMultipleOnPremModelsAsync(onPremModelIds));
    }

    // Search OnPrem models by name
    [HttpGet("search/{modelName}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<OnPremModelDto>>>> SearchOnPremModelsByName(string modelName)
    {
        return ResultHelper(await _onPremModelService.SearchOnPremModelsByNameAsync(modelName));
    }

    // Sync OnPrem models with an external provider (e.g., Ollama)
    [HttpPost("sync")]
    public async Task<ActionResult<ServiceResponse<bool>>> SyncOnPremModels([FromBody] SyncOnPremModelsDto syncOnPremModelsDto)
    {
        return ResultHelper(await _onPremModelService.SyncAllOnPremModelsAsync(syncOnPremModelsDto));
    }

}