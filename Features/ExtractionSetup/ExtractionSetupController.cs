namespace MLModelBuilderAPIs.Controllers;

[Route("extraction-setup")]
[ApiController]
[Authorize]
public class ExtractionSetupController : BaseApiController
{
    private readonly IExtractionSetupService _extractionSetupService;

    // Constructor with dependency injection for the extraction setup service
    public ExtractionSetupController(IExtractionSetupService extractionSetupService)
    {
        _extractionSetupService = extractionSetupService;
    }

    // Retrieves all extraction setups created by the authenticated user
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractionSetupDto>>>> GetAllExtractionSetups()
    {
        return ResultHelper(await _extractionSetupService.RetrieveAllExtractionSetupsAsync());
    }

    // Creates a new extraction setup
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ExtractionSetupDto>>> CreateExtractionSetup([FromBody] ExtractionSetupDto extractionSetupDto)
    {
        return ResultHelper(await _extractionSetupService.InsertExtractionSetupAsync(extractionSetupDto));
    }

    // Updates an existing extraction setup
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ExtractionSetupDto>>> UpdateExtractionSetup([FromBody] ExtractionSetupDto extractionSetupDto)
    {
        return ResultHelper(await _extractionSetupService.UpdateExtractionSetupAsync(extractionSetupDto));
    }

    // Permanently deletes an extraction setup by ID
    [HttpDelete("{extractionSetupId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteExtractionSetup(Guid extractionSetupId)
    {
        return ResultHelper(await _extractionSetupService.RemoveExtractionSetupAsync(extractionSetupId));
    }

    // Deletes multiple extraction setups in one request
    [HttpDelete("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> DeleteMultipleExtractionSetups([FromBody] IEnumerable<Guid> extractionSetupIds)
    {
        return ResultHelper(await _extractionSetupService.RemoveMultipleExtractionSetupAsync(extractionSetupIds));
    }

    // Retrieves a specific extraction setup by its unique ID
    [HttpGet("{extractionSetupId}")]
    public async Task<ActionResult<ServiceResponse<ExtractionSetupDto>>> GetExtractionSetupById(Guid extractionSetupId)
    {
        return ResultHelper(await _extractionSetupService.RetrieveExtractionSetupByIdAsync(extractionSetupId));
    }
    
    // Retrieves a specific extraction setup by ml model ID
    [HttpGet("ml-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<ExtractionSetupDto>>> GetExtractionSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _extractionSetupService.RetrieveExtractionSetupByIdAsync(mlModelId));
    }
}