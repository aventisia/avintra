namespace MLModelBuilderAPIs.Controllers;

[Route("extraction")]
[ApiController]
[Authorize]
public class ExtractionSetupController : BaseApiController
{
    private readonly IExtractionSetupService _extractionSetupService;

    public ExtractionSetupController(IExtractionSetupService extractionSetupService)
    {
        _extractionSetupService = extractionSetupService;
    }

    // -------------------- Setup & Test Endpoints --------------------

    // Updates an existing extraction setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<ExtractionSetupDto>>> UpdateExtractionSetup([FromBody] MLModelSetupDto mlModelSetupDto)
    {
        return ResultHelper(await _extractionSetupService.UpdateExtractionSetupAsync(mlModelSetupDto));
    }

    // Retrieves a specific extraction setup by ml model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<ExtractionSetupDto>>> GetExtractionSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _extractionSetupService.GetExtractionSetupByMLModelIdAsync(mlModelId));
    }

    // Extracts data via a Language Learning Model (LLM)
    [HttpPost("extract-via-llm")]
    public async Task<ActionResult<ServiceResponse<ExtractionResponseDto>>> ExtractViaLLM(ExtractRequestDto extractRequestDto)
    {
        return ResultHelper(await _extractionSetupService.ExtractViaLLMAsync(extractRequestDto));
    }

    // Retrieves a collection of extracted data records associated with a specific machine learning model.
    [HttpGet("extracted-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractedDataResponseDto>>>> GetExtractedDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _extractionSetupService.GetExtractedDataByMLModelIdAsync(mlModelId));
    }

    // -------------------- Run & Review Data Endpoints --------------------

    // Retrieves a collection of extracted review data records associated with a specific machine learning model.
    [HttpGet("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractionReviewDataDto>>>> GetExtractedReviewDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _extractionSetupService.GetExtractedReviewDataByMLModelIdAsync(mlModelId));
    }

    // Updates one or more extracted review data records linked to a specific machine learning model.
    [HttpPut("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<ExtractedDataResponseDto>>> UpdateExtractedReviewData(ExtractedDataResponseDto extractedDataResponseDto)
    {
        return ResultHelper(await _extractionSetupService.UpdateExtractedReviewDataAsync(extractedDataResponseDto));
    }

    // Adds review data associated with a specific machine learning model.
    [HttpPost("review-data")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractionReviewDataDto>>>> AddReviewDataByMLModelId(CreateModelReviewRequestDto createModelReviewRequestDto)
    {
        return ResultHelper(await _extractionSetupService.AddReviewDataAsync(createModelReviewRequestDto));
    }

    // -------------------- Fine-Tining Data Endpoints --------------------

    // Retrieves a collection of fine-tuning data records associated with the specified machine learning model ID.
    [HttpGet("fine-tuning/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>>> GetFineTunningDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _extractionSetupService.GetFineTunningDataByMLModelIdAsync(mlModelId));
    }

    // Schedules a fine-tuning job for a specific machine learning model by sending the fine-tuning request details.
    [HttpPost("schedule-fine-tuning")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>>> ScheduleFineTuningAsync(AddFineTuningRequestDto addFineTuningRequestDto)
    {
        return ResultHelper(await _extractionSetupService.ScheduleFineTuningAsync(addFineTuningRequestDto));
    }

    // Retrieves the fine-tuning history records associated with a specific ML model.
    [HttpGet("fine-tuning/histories/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> GetFineTuningDataHistories(Guid mlModelId)
    {
        return ResultHelper(await _extractionSetupService.GetFineTuningDataHistoriesAsync(mlModelId));
    }
    // Reschedules fine-tuning for an ML model using provided configuration.
    [HttpPost("reschedule-fine-tuning")]
    public async Task<ActionResult<ServiceResponse<FineTuningHistoryDto>>> RescheduleFineTuning(RescheduleFineTuningDto rescheduleFineTuningDto)
    {
        return ResultHelper(await _extractionSetupService.RescheduleFineTuningAsync(rescheduleFineTuningDto));
    }

    // Deletes a specific fine-tuning history record by ID.
    [HttpDelete("fine-tuning/histories/{fineTuningHistoryId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> DeleteFineTuningDataHistory(Guid fineTuningHistoryId)
    {
        return ResultHelper(await _extractionSetupService.DeleteFineTuningDataHistoryAsync(fineTuningHistoryId));
    }

    // Deletes multiple fine-tuning history records given a list of their IDs.
    [HttpPost("fine-tuning/histories/delete-multiple")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> DeleteMultipleFineTuningDataHistories(IEnumerable<Guid> fineTuningHistoryIds)
    {
        return ResultHelper(await _extractionSetupService.DeleteMultipleFineTuningDataHistoriesAsync(fineTuningHistoryIds));
    }
}