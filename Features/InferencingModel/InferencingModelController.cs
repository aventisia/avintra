namespace MLModelBuilderAPIs.Controllers;

[Route("inferencing-model")]
[ApiController]
[Authorize]
public class InferencingModelController : BaseApiController
{
    private readonly IInferencingModelService _inferencingModelService;

    public InferencingModelController(IInferencingModelService inferencingModelService)
    {
        _inferencingModelService = inferencingModelService;
    }

    // -------------------- Setup & Test Endpoints --------------------

    // Retrieves a specific model setup by ml model ID
    [HttpGet("setup/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<InferencingModelDto>>> GetSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _inferencingModelService.GetSetupByMLModelIdAsync(mlModelId));
    }

    // Updates an existing model setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<InferencingModelDto>>> UpdateSetup([FromBody] InferencingModelDto modelSetupDto)
    {
        return ResultHelper(await _inferencingModelService.UpdateSetupAsync(modelSetupDto));
    }

    // Execute data via a Language Learning Model (LLM)
    [HttpPost("execute")]
    public async Task<ActionResult<ServiceResponse<ExtractionResponseDto>>> ExtractViaLLM(ModelFileProcessingRequestDto modelExecutionRequestDto)
    {
        return ResultHelper(await _inferencingModelService.ExecuteLLMByFileIdsAsync(modelExecutionRequestDto));
    }

    // // Retrieves a collection of extracted data records associated with a specific machine learning model.
    // [HttpGet("extracted-data/{mlModelId}")]
    // public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractedDataResponseDto>>>> GetExtractedDataByMLModelId(Guid mlModelId)
    // {
    //     return ResultHelper(await _inferencingModelService.GetExtractedDataByMLModelIdAsync(mlModelId));
    // }

    // // -------------------- Run & Review Data Endpoints --------------------

    // // Retrieves a collection of extracted review data records associated with a specific machine learning model.
    // [HttpGet("review-data/{mlModelId}")]
    // public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractionReviewDataDto>>>> GetExtractedReviewDataByMLModelId(Guid mlModelId)
    // {
    //     return ResultHelper(await _inferencingModelService.GetExtractedReviewDataByMLModelIdAsync(mlModelId));
    // }

    // // Updates one or more extracted review data records linked to a specific machine learning model.
    // [HttpPut("review-data/{mlModelId}")]
    // public async Task<ActionResult<ServiceResponse<ExtractedDataResponseDto>>> UpdateExtractedReviewData(ExtractedDataResponseDto extractedDataResponseDto)
    // {
    //     return ResultHelper(await _inferencingModelService.UpdateExtractedReviewDataAsync(extractedDataResponseDto));
    // }

    // // Adds review data associated with a specific machine learning model.
    // [HttpPost("review-data")]
    // public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractionReviewDataDto>>>> AddReviewDataByMLModelId(CreateModelReviewRequestDto createModelReviewRequestDto)
    // {
    //     return ResultHelper(await _inferencingModelService.AddReviewDataAsync(createModelReviewRequestDto));
    // }

    // // -------------------- Fine-Tining Data Endpoints --------------------

    // // Retrieves a collection of fine-tuning data records associated with the specified machine learning model ID.
    // [HttpGet("fine-tuning/{mlModelId}")]
    // public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>>> GetFineTunningDataByMLModelId(Guid mlModelId)
    // {
    //     return ResultHelper(await _inferencingModelService.GetFineTunningDataByMLModelIdAsync(mlModelId));
    // }

    // // Schedules a fine-tuning job for a specific machine learning model by sending the fine-tuning request details.
    // [HttpPost("schedule-fine-tuning")]
    // public async Task<ActionResult<ServiceResponse<IEnumerable<ExtractionFineTuningDataDto>>>> ScheduleFineTuningAsync(AddFineTuningRequestDto addFineTuningRequestDto)
    // {
    //     return ResultHelper(await _inferencingModelService.ScheduleFineTuningAsync(addFineTuningRequestDto));
    // }

    // // Retrieves the fine-tuning history records associated with a specific ML model.
    // [HttpGet("fine-tuning/histories/{mlModelId}")]
    // public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> GetFineTuningDataHistories(Guid mlModelId)
    // {
    //     return ResultHelper(await _inferencingModelService.GetFineTuningDataHistoriesAsync(mlModelId));
    // }
    // // Reschedules fine-tuning for an ML model using provided configuration.
    // [HttpPost("reschedule-fine-tuning")]
    // public async Task<ActionResult<ServiceResponse<FineTuningHistoryDto>>> RescheduleFineTuning(RescheduleFineTuningDto rescheduleFineTuningDto)
    // {
    //     return ResultHelper(await _inferencingModelService.RescheduleFineTuningAsync(rescheduleFineTuningDto));
    // }

    // // Deletes a specific fine-tuning history record by ID.
    // [HttpDelete("fine-tuning/histories/{fineTuningHistoryId}")]
    // public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> DeleteFineTuningDataHistory(Guid fineTuningHistoryId)
    // {
    //     return ResultHelper(await _inferencingModelService.DeleteFineTuningDataHistoryAsync(fineTuningHistoryId));
    // }

    // // Deletes multiple fine-tuning history records given a list of their IDs.
    // [HttpPost("fine-tuning/histories/delete-multiple")]
    // public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> DeleteMultipleFineTuningDataHistories(IEnumerable<Guid> fineTuningHistoryIds)
    // {
    //     return ResultHelper(await _inferencingModelService.DeleteMultipleFineTuningDataHistoriesAsync(fineTuningHistoryIds));
    // }
}