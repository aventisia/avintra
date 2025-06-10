namespace MLModelBuilderAPIs.Controllers;

[Route("summarization")]
[ApiController]
[Authorize]
public class SummarizationController : BaseApiController
{
    private readonly ISummarizationService _summarizationService;

    public SummarizationController(ISummarizationService SummarizationService)
    {
        _summarizationService = SummarizationService;
    }

    // -------------------- Setup & Test Endpoints --------------------

    // Updates an existing summarization setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<SummarizationDto>>> UpdateSummarizationSetup([FromBody] SummarizationDto summarizationDto)
    {
        return ResultHelper(await _summarizationService.UpdateSummarizationSetupAsync(summarizationDto));
    }

    // Retrieves a specific summarization setup by ml model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<SummarizationDto>>> GetSummarizationSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _summarizationService.GetSummarizationSetupByMLModelIdAsync(mlModelId));
    }

    // Extracts data via a Language Learning Model (LLM)
    [HttpPost("extract-via-llm")]
    public async Task<ActionResult<ServiceResponse<SummarizationResponseDto>>> ExtractViaLLM(ExtractRequestDto extractRequestDto)
    {
        return ResultHelper(await _summarizationService.ExtractViaLLMAsync(extractRequestDto));
    }

    // Retrieves a collection of extracted data records associated with a specific machine learning model
    [HttpGet("extracted-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SummarizationExtractedDataDto>>>> GetExtractedDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _summarizationService.GetExtractedDataByMLModelIdAsync(mlModelId));
    }

    // -------------------- Run & Review Data Endpoints --------------------

    // Retrieves a collection of extracted review data records associated with a specific machine learning model
    [HttpGet("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SummarizationReviewDataDto>>>> GetExtractedReviewDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _summarizationService.GetExtractedReviewDataByMLModelIdAsync(mlModelId));
    }

    // Updates one or more extracted review data records linked to a specific machine learning model
    [HttpPut("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<SummarizationExtractedDataDto>>> UpdateExtractedReviewData(SummarizationExtractedDataDto summarizationExtractedDataDto)
    {
        return ResultHelper(await _summarizationService.UpdateExtractedReviewDataAsync(summarizationExtractedDataDto));
    }

    // Adds review data associated with a specific machine learning model
    [HttpPost("review-data")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SummarizationReviewDataDto>>>> AddReviewDataByMLModelId(CreateModelReviewRequestDto createModelReviewRequestDto)
    {
        return ResultHelper(await _summarizationService.AddReviewDataAsync(createModelReviewRequestDto));
    }

    // -------------------- Fine-Tining Data Endpoints --------------------

    /// Retrieves a collection of fine-tuning data records associated with the specified machine learning model ID.
    [HttpGet("fine-tuning/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SummarizationFineTuningDataDto>>>> GetFineTunningDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _summarizationService.GetFineTunningDataByMLModelIdAsync(mlModelId));
    }

    // Schedules a fine-tuning job for a specific machine learning model by sending the fine-tuning request details.
    [HttpPost("schedule-fine-tuning")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SummarizationFineTuningDataDto>>>> ScheduleFineTuningAsync(AddFineTuningRequestDto addFineTuningRequestDto)
    {
        return ResultHelper(await _summarizationService.ScheduleFineTuningAsync(addFineTuningRequestDto));
    }

    // Retrieves the fine-tuning history records associated with a specific ML model.
    [HttpGet("fine-tuning/histories/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> GetFineTuningDataHistories(Guid mlModelId)
    {
        return ResultHelper(await _summarizationService.GetFineTuningDataHistoriesAsync(mlModelId));
    }

    // Reschedules fine-tuning for an ML model using provided configuration.
    [HttpPut("reschedule-fine-tuning")]
    public async Task<ActionResult<ServiceResponse<FineTuningHistoryDto>>> RescheduleFineTuning(RescheduleFineTuningDto rescheduleFineTuningDto)
    {
        return ResultHelper(await _summarizationService.RescheduleFineTuningAsync(rescheduleFineTuningDto));
    }

    // Deletes a specific fine-tuning history record by ID.
    [HttpDelete("fine-tuning/histories/{fineTuningHistoryId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> DeleteFineTuningDataHistory(Guid fineTuningHistoryId)
    {
        return ResultHelper(await _summarizationService.DeleteFineTuningDataHistoryAsync(fineTuningHistoryId));
    }

    // Deletes multiple fine-tuning history records given a list of their IDs.
    [HttpPost("fine-tuning/histories/delete-multiple")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> DeleteMultipleFineTuningDataHistories(IEnumerable<Guid> fineTuningHistoryIds)
    {
        return ResultHelper(await _summarizationService.DeleteMultipleFineTuningDataHistoriesAsync(fineTuningHistoryIds));
    }
}
