namespace MLModelBuilderAPIs.Controllers;

[Route("extraction-setup")]
[ApiController]
[Authorize]
public class ExtractionSetupController : BaseApiController
{
    private readonly IExtractionSetupService _extractionSetupService;

    public ExtractionSetupController(IExtractionSetupService extractionSetupService)
    {
        _extractionSetupService = extractionSetupService;
    }

    // Updates an existing extraction setup
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ExtractionSetupDto>>> UpdateExtractionSetup([FromBody] MLModelSetupDto mlModelSetupDto)
    {
        return ResultHelper(await _extractionSetupService.UpdateExtractionSetupAsync(mlModelSetupDto));
    }

    // Retrieves a specific extraction setup by ml model ID
    [HttpGet("ml-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<ExtractionSetupDto>>> GetExtractionSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _extractionSetupService.GetExtractionSetupByMLModelIdAsync(mlModelId));
    }
}