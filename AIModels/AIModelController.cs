namespace MLModelBuilderAPIs.Controllers;

[Route("ai-models")]
[ApiController]
public class AIModelController : BaseApiController
{
    private readonly IAIModelService _aiModelService;

    public AIModelController(IAIModelService aiModelService)
    {
        _aiModelService = aiModelService;
    }

    /// Fetches a list of all published machine learning models
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIModelDto>>>> GetAIModels()
    {
        return ResultHelper(await _aiModelService.GetAIModelsAsync());
    }

    /// Fetches the extraction setup configuration for a specific ML model by ID
    [ApiKeyAuth]
    [HttpGet("setup/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<object>>> GetSetupByMLModel(Guid mlModelId)
    {
        return ResultHelper(await _aiModelService.GetAIModelSetupByIdAsync(mlModelId));
    }

    // Initiates a data extraction process using a Language Learning Model (LLM)
    [ApiKeyAuth]
    [HttpPost("execute")]
    public async Task<ActionResult<ServiceResponse<object>>> ExecuteViaLLM(ExtractRequestDto extractRequestDto)
    {
        return ResultHelper(await _aiModelService.ExecuteViaLLMAsync(extractRequestDto));
    }
    
    // Adds a new document record to the system for processing by a Language Learning Model (LLM).
    [ApiKeyAuth]
    [HttpPost("documents")]
    public async Task<ActionResult<ServiceResponse<object>>> AddDocumentRecord([FromBody] AddDocumentRequestDto addDocumentRequestDto)
    {
        return ResultHelper(await _aiModelService.AddDocumentRecordAsync(addDocumentRequestDto));
    }
}
