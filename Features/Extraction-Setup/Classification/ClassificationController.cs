namespace MLModelBuilderAPIs.Controllers;

[Route("classification")]
[ApiController]
[Authorize]
public class ClassificationController : BaseApiController
{
    private readonly IClassificationService _ClassificationService;

    public ClassificationController(IClassificationService ClassificationService)
    {
        _ClassificationService = ClassificationService;
    }

    // Updates an existing extraction setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<ClassificationDto>>> UpdateClassificationSetup([FromBody] ClassificationDto classificationDto)
    {
        return ResultHelper(await _ClassificationService.UpdateClassificationSetupAsync(classificationDto));
    }

    // Retrieves a specific extraction setup by ml model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<ClassificationDto>>> GetClassificationSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _ClassificationService.GetClassificationSetupByMLModelIdAsync(mlModelId));
    }
}