namespace MLModelBuilderAPIs.Controllers;

[Route("classification")]
[ApiController]
[Authorize]
public class ClassificationController : BaseApiController
{
    private readonly IClassificationService _classificationService;

    public ClassificationController(IClassificationService ClassificationService)
    {
        _classificationService = ClassificationService;
    }

    // -------------------- Setup & Test Endpoints --------------------

    // Updates an existing extraction setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<ClassificationDto>>> UpdateClassificationSetup([FromBody] ClassificationDto classificationDto)
    {
        return ResultHelper(await _classificationService.UpdateClassificationSetupAsync(classificationDto));
    }

    // Retrieves a specific extraction setup by ml model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<ClassificationDto>>> GetClassificationSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _classificationService.GetClassificationSetupByMLModelIdAsync(mlModelId));
    }

    // Extracts data via a Language Learning Model (LLM)
    [HttpPost("extract-via-llm")]
    public async Task<ActionResult<ServiceResponse<ClassificationResponseDto>>> ExtractViaLLM(ExtractRequestDto extractRequestDto)
    {
        return ResultHelper(await _classificationService.ExtractViaLLMAsync(extractRequestDto));
    }

    // Retrieves a collection of extracted data records associated with a specific machine learning model.
    [HttpGet("extracted-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ClassificationExtractedDataDto>>>> GetExtractedDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _classificationService.GetExtractedDataByMLModelIdAsync(mlModelId));
    }

    // -------------------- Run & Review Data Endpoints --------------------

    // Retrieves a collection of extracted review data records associated with a specific machine learning model.
    [HttpGet("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ClassificationReviewDataDto>>>> GetExtractedReviewDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _classificationService.GetExtractedReviewDataByMLModelIdAsync(mlModelId));
    }

    // Updates one or more extracted review data records linked to a specific machine learning model.
    [HttpPut("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<ClassificationExtractedDataDto>>> UpdateExtractedReviewData(ClassificationExtractedDataDto classificationExtractedDataDto)
    {
        return ResultHelper(await _classificationService.UpdateExtractedReviewDataAsync(classificationExtractedDataDto));
    }

    // Adds review data associated with a specific machine learning model.
    [HttpPost("review-data")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ClassificationReviewDataDto>>>> AddReviewDataByMLModelId(CreateModelReviewRequestDto createModelReviewRequestDto)
    {
        return ResultHelper(await _classificationService.AddReviewDataAsync(createModelReviewRequestDto));
    }

    // -------------------- Fine-Tining Data Endpoints --------------------

    // Retrieves a collection of fine-tuning data records associated with the specified machine learning model ID.
    [HttpGet("fine-tuning/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ClassificationFineTuningDataDto>>>> GetFineTunningDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _classificationService.GetFineTunningDataByMLModelIdAsync(mlModelId));
    }

    // Schedules a fine-tuning job for a specific machine learning model by sending the fine-tuning request details.
    [HttpPost("schedule-fine-tuning")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ClassificationFineTuningDataDto>>>> ScheduleFineTuningAsync(AddFineTuningRequestDto addFineTuningRequestDto)
    {
        return ResultHelper(await _classificationService.ScheduleFineTuningAsync(addFineTuningRequestDto));
    }

    // Retrieves the fine-tuning history records associated with a specific ML model.
    [HttpGet("fine-tuning/histories/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> GetFineTuningDataHistories(Guid mlModelId)
    {
        return ResultHelper(await _classificationService.GetFineTuningDataHistoriesAsync(mlModelId));
    }

        // Reschedules fine-tuning for an ML model using provided configuration.
    [HttpPost("reschedule-fine-tuning")]
    public async Task<ActionResult<ServiceResponse<ClassificationFineTuningDataDto>>> RescheduleFineTuning(RescheduleFineTuningDto rescheduleFineTuningDto)
    {
        return ResultHelper(await _classificationService.RescheduleFineTuningAsync(rescheduleFineTuningDto));
    }

    // Deletes a specific fine-tuning history record by ID.
    [HttpDelete("fine-tuning/histories/{fineTuningHistoryId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> DeleteFineTuningDataHistory(Guid fineTuningHistoryId)
    {
        return ResultHelper(await _classificationService.DeleteFineTuningDataHistoryAsync(fineTuningHistoryId));
    }

    // Deletes multiple fine-tuning history records given a list of their IDs.
    [HttpPost("fine-tuning/histories/delete-multiple")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> DeleteMultipleFineTuningDataHistories(IEnumerable<Guid> fineTuningHistoryIds)
    {
        return ResultHelper(await _classificationService.DeleteMultipleFineTuningDataHistoriesAsync(fineTuningHistoryIds));
    }
}