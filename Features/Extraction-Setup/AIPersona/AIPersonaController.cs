namespace MLModelBuilderAPIs.Controllers;

[Route("ai-persona")]
[ApiController]
[Authorize]
public class AIPersonaController : BaseApiController
{
    private readonly IAIPersonaService _aiPersonaService;

    public AIPersonaController(IAIPersonaService aiPersonaService)
    {
        _aiPersonaService = aiPersonaService;
    }

    // -------------------- Setup & Test Endpoints --------------------

    // Updates an existing AI persona setup
    [HttpPut("setup")]
    public async Task<ActionResult<ServiceResponse<AIPersonaDto>>> UpdateAIPersonaSetup([FromBody] AIPersonaDto aiPersonaDto)
    {
        return ResultHelper(await _aiPersonaService.UpdateAIPersonaSetupAsync(aiPersonaDto));
    }

    // Retrieves a specific AI persona setup by ML model ID
    [HttpGet("setup-by-model/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<AIPersonaDto>>> GetAIPersonaSetupByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _aiPersonaService.GetAIPersonaSetupByMLModelIdAsync(mlModelId));
    }

    //Initializes the connection and starts the AI persona extraction using the specified ML model.
    [HttpPost("initialize-connection/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<AIPersonaResponseDto>>> ExtractViaLLM(Guid mlModelId)
    {
        return ResultHelper(await _aiPersonaService.InitializeConnectionToLLMAsync(mlModelId));
    }

    // Retrieves a collection of extracted AI persona data records associated with a specific machine learning model
    [HttpGet("extracted-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIPersonaExtractedDataDto>>>> GetExtractedDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _aiPersonaService.GetExtractedDataByMLModelIdAsync(mlModelId));
    }

    // -------------------- Run & Review Data Endpoints --------------------

    // Retrieves a collection of extracted AI persona review data records associated with a specific machine learning model
    [HttpGet("review-data/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIPersonaReviewDataDto>>>> GetExtractedReviewDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _aiPersonaService.GetAIPersonaReviewDataByMLModelIdAsync(mlModelId));
    }

    // Updates one or more extracted AI persona review data records linked to a specific machine learning model
    [HttpPut("review-data")]
    public async Task<ActionResult<ServiceResponse<AIPersonaExtractedDataDto>>> UpdateExtractedReviewData(AIPersonaExtractedDataDto aiPersonaExtractedDataDto)
    {
        return ResultHelper(await _aiPersonaService.UpdateAIPersonaReviewDataAsync(aiPersonaExtractedDataDto));
    }

    // Adds AI persona review data associated with a specific machine learning model
    [HttpPost("review-data")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIPersonaReviewDataDto>>>> AddReviewDataByMLModelId(CreateModelReviewRequestDto createModelReviewRequestDto)
    {
        return ResultHelper(await _aiPersonaService.AddReviewDataAsync(createModelReviewRequestDto));
    }

    // -------------------- Fine-Tuning Data Endpoints --------------------

    // Retrieves a collection of fine-tuning data records associated with the specified machine learning model ID for AI persona
    [HttpGet("fine-tuning/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIPersonaFineTuningDataDto>>>> GetFineTuningDataByMLModelId(Guid mlModelId)
    {
        return ResultHelper(await _aiPersonaService.GetFineTuningDataByMLModelIdAsync(mlModelId));
    }

    // Schedules a fine-tuning job for a specific machine learning model by sending the fine-tuning request details for AI persona
    [HttpPost("schedule-fine-tuning")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AIPersonaFineTuningDataDto>>>> ScheduleFineTuningAsync(AddFineTuningRequestDto addFineTuningRequestDto)
    {
        return ResultHelper(await _aiPersonaService.ScheduleFineTuningAsync(addFineTuningRequestDto));
    }

    // Retrieves the fine-tuning history records associated with a specific ML model for AI persona
    [HttpGet("fine-tuning/histories/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> GetFineTuningDataHistories(Guid mlModelId)
    {
        return ResultHelper(await _aiPersonaService.GetFineTuningDataHistoriesAsync(mlModelId));
    }

    // Reschedules fine-tuning for an ML model using provided configuration.
    [HttpPost("reschedule-fine-tuning")]
    public async Task<ActionResult<ServiceResponse<FineTuningHistoryDto>>> RescheduleFineTuning(RescheduleFineTuningDto rescheduleFineTuningDto)
    {
        return ResultHelper(await _aiPersonaService.RescheduleFineTuningAsync(rescheduleFineTuningDto));
    }

    // Deletes a specific fine-tuning history record by ID.
    [HttpDelete("fine-tuning/histories/{fineTuningHistoryId}")]
    public async Task<ActionResult<ServiceResponse<FineTuningHistoryDto>>> DeleteFineTuningDataHistory(Guid fineTuningHistoryId)
    {
        return ResultHelper(await _aiPersonaService.DeleteFineTuningDataHistoryAsync(fineTuningHistoryId));
    }

    // Deletes multiple fine-tuning history records given a list of their IDs.
    [HttpPost("fine-tuning/histories/delete-multiple")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FineTuningHistoryDto>>>> DeleteMultipleFineTuningDataHistories(IEnumerable<Guid> fineTuningHistoryIds)
    {
        return ResultHelper(await _aiPersonaService.DeleteMultipleFineTuningDataHistoriesAsync(fineTuningHistoryIds));
    }
}