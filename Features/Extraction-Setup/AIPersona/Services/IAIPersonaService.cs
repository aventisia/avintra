namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Provides an interface for managing AI persona setups related to machine learning models,
/// including retrieval and update operations.
/// </summary>
public interface IAIPersonaService
{
    /// <summary>
    /// Updates the AI persona setup for a specific machine learning model.
    /// Applies changes based on the provided <paramref name="personaDto"/> and returns the updated configuration.
    /// </summary>
    /// <param name="personaDto">The data transfer object containing the updated AI persona setup details.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result is a service response 
    /// containing the updated AI persona configuration.
    /// </returns>
    Task<ServiceResponse<AIPersonaDto>> UpdateAIPersonaSetupAsync(AIPersonaDto personaDto);

    /// <summary>
    /// Retrieves the AI persona setup associated with the specified machine learning model ID.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result is a service response 
    /// containing the AI persona configuration for the given model ID.
    /// </returns>
    Task<ServiceResponse<AIPersonaDto>> GetAIPersonaSetupByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Initializes the connection and starts the AI persona data extraction process using LLM. 
    /// </summary>
    /// <param name="modelId">The unique identifier for the model to extract AI persona data for.</param>
    /// <returns>A ServiceResponse containing the extraction result or failure message.</returns>
    Task<ServiceResponse<AIPersonaResponseDto>> InitializeConnectionToLLMAsync(Guid modelId);

    /// <summary>
    /// Asynchronously retrieves a list of extracted AI persona data records linked to a specific machine learning model.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation, with a result containing a service response
    /// that includes a collection of <see cref="AIPersonaExtractedDataDto"/> objects.
    /// </returns>
    Task<ServiceResponse<IEnumerable<AIPersonaExtractedDataDto>>> GetExtractedDataByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Asynchronously retrieves a list of extracted AI persona review data records associated with a specific machine learning model.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation, containing a service response with a collection of <see cref="AIPersonaReviewDataDto"/> objects.
    /// </returns>
    Task<ServiceResponse<IEnumerable<AIPersonaReviewDataDto>>> GetAIPersonaReviewDataByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Updates an extracted review data record associated with a specific machine learning model for the AI persona.
    /// </summary>
    /// <param name="aiPersonaExtractedDataDto">The DTO containing the updated review data information.</param>
    /// <returns>A service response containing the updated review data record.</returns>
    Task<ServiceResponse<AIPersonaExtractedDataDto>> UpdateAIPersonaReviewDataAsync(AIPersonaExtractedDataDto aiPersonaExtractedDataDto);

    /// <summary>
    /// Adds new AI persona review data based on the provided request DTO.
    /// </summary>
    /// <param name="createModelReviewRequestDto">The data transfer object containing the review information to be added.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains a ServiceResponse with a collection of AIPersonaReviewDataDto representing the added or affected review data.
    /// </returns>
    Task<ServiceResponse<IEnumerable<AIPersonaReviewDataDto>>> AddReviewDataAsync(CreateModelReviewRequestDto createModelReviewRequestDto);

    /// <summary>
    /// Retrieves a collection of fine-tuning data records associated with the specified machine learning model ID for the AI persona.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. 
    /// The task result contains a <see cref="ServiceResponse{T}"/> with a list of <see cref="AIPersonaFineTuningDataDto"/>.
    /// </returns>
    Task<ServiceResponse<IEnumerable<AIPersonaFineTuningDataDto>>> GetFineTuningDataByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Schedules a fine-tuning job for a specific machine learning model by sending the fine-tuning request details for the AI persona.
    /// </summary>
    /// <param name="addFineTuningRequestDto">The details of the fine-tuning request, such as model parameters and data.</param>
    /// <returns>A service response containing a list of fine-tuning data or an error message.</returns>
    Task<ServiceResponse<IEnumerable<AIPersonaFineTuningDataDto>>> ScheduleFineTuningAsync(AddFineTuningRequestDto addFineTuningRequestDto);

    /// <summary>
    /// Retrieves the fine-tuning history records for a specified machine learning model related to the AI persona.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model whose fine-tuning history is to be fetched.</param>
    /// <returns>A task representing the asynchronous operation, with a response containing the list of fine-tuning history records.</returns>
    Task<ServiceResponse<IEnumerable<FineTuningHistoryDto>>> GetFineTuningDataHistoriesAsync(Guid mlModelId);

    // <summary>
    /// Re-schedules a fine-tuning operation using the provided summarization fine-tuning data.
    /// </summary>
    /// <param name="rescheduleFineTuningDto">An object containing the configuration data for the summarization fine-tuning.</param>
    /// <returns>
    /// A task representing the asynchronous operation.
    /// The result contains a <see cref="ServiceResponse{FineTuningHistoryDto}"/> 
    /// with the updated fine-tuning configuration and status.
    /// </returns>
    Task<ServiceResponse<FineTuningHistoryDto>> RescheduleFineTuningAsync(RescheduleFineTuningDto rescheduleFineTuningDto);

    /// <summary>
    /// Deletes a specific fine-tuning history record identified by its unique ID.
    /// </summary>
    /// <param name="fineTuningHistoryId">The unique identifier of the fine-tuning history entry to be deleted.</param>
    /// <returns>
    /// A task representing the asynchronous operation.
    /// The result contains a <see cref="ServiceResponse{bool}"/> indicating whether the deletion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteFineTuningDataHistoryAsync(Guid fineTuningHistoryId);

    /// <summary>
    /// Deletes multiple fine-tuning history records based on the provided collection of IDs.
    /// </summary>
    /// <param name="fineTuningHistoryIds">A collection of unique identifiers for the fine-tuning history records to delete.</param>
    /// <returns>
    /// A <see cref="Task{TResult}"/> containing a <see cref="ServiceResponse{Boolean}"/> indicating 
    /// whether the deletion operation was successful.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteMultipleFineTuningDataHistoriesAsync(IEnumerable<Guid> fineTuningHistoryIds);
}