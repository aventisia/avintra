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

    /// Retrieves a list of published ML models
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIModelDto>>>> GetAIModels()
    {
        return ResultHelper(await _aiModelService.GetAIModelsAsync());
    }
}

