namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Provides an interface for managing summarization setups related to machine learning models,
/// including retrieval and update operations.
/// </summary>
public interface ISummarizationService
{
    /// <summary>
    /// Updates the summarization setup for a specific machine learning model.
    /// Applies changes based on the provided <paramref name="summarizationDto"/> and returns the updated configuration.
    /// </summary>
    /// <param name="summarizationDto">The data transfer object containing the updated summarization setup details.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result is a service response 
    /// containing the updated summarization configuration.
    /// </returns>
    Task<ServiceResponse<SummarizationDto>> UpdateSummarizationSetupAsync(SummarizationDto summarizationDto);

    /// <summary>
    /// Retrieves the summarization setup associated with the specified machine learning model ID.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result is a service response 
    /// containing the summarization configuration for the given model ID.
    /// </returns>
    Task<ServiceResponse<SummarizationDto>> GetSummarizationSetupByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Extracts data asynchronously using a Language Learning Model (LLM).
    /// </summary>
    /// <param name="extractRequestDto">The data transfer object containing the extraction parameters.</param>
    /// <returns>
    /// An asynchronous task that returns a service response containing an enumeration of extraction response DTOs.
    /// </returns>
    Task<ServiceResponse<SummarizationResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto);

    /// <summary>
    /// Asynchronously retrieves a list of extracted data records linked to a specific machine learning model.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation, with a result containing a service response
    /// that includes a collection of <see cref="SummarizationExtractedDataDto"/> objects.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SummarizationExtractedDataDto>>> GetExtractedDataByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Asynchronously retrieves a list of extracted review data records associated with a specific machine learning model.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation, containing a service response with a collection of <see cref="SummarizationReviewDataDto"/> objects.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SummarizationReviewDataDto>>> GetExtractedReviewDataByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Updates an extracted review data record associated with a specific machine learning model.
    /// </summary>
    /// <param name="summarizationExtractedDataDto">The DTO containing the updated review data information.</param>
    /// <returns>A service response containing the updated review data record.</returns>
    Task<ServiceResponse<SummarizationExtractedDataDto>> UpdateExtractedReviewDataAsync(SummarizationExtractedDataDto summarizationExtractedDataDto);

    /// <summary>
    /// Adds new model review data based on the provided request DTO.
    /// </summary>
    /// <param name="createModelReviewRequestDto">The data transfer object containing the review information to be added.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains a ServiceResponse with a collection of SummarizationReviewDataDto representing the added or affected review data.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SummarizationReviewDataDto>>> AddReviewDataAsync(CreateModelReviewRequestDto createModelReviewRequestDto);

    /// <summary>
    /// Retrieves a collection of fine-tuning data records associated with the specified machine learning model ID.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. 
    /// The task result contains a <see cref="ServiceResponse{T}"/> with a list of <see cref="SummarizationFineTuningDataDto"/>.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SummarizationFineTuningDataDto>>> GetFineTunningDataByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Schedules a fine-tuning job for a specific machine learning model by sending the fine-tuning request details.
    /// </summary>
    /// <param name="addFineTuningRequestDto">The details of the fine-tuning request, such as model parameters and data.</param>
    /// <returns>A service response containing a list of fine-tuning data or an error message.</returns>
    Task<ServiceResponse<IEnumerable<SummarizationFineTuningDataDto>>> ScheduleFineTuningAsync(AddFineTuningRequestDto addFineTuningRequestDto);

    /// <summary>
    /// Retrieves the fine-tuning history records for a specified machine learning model.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model whose fine-tuning history is to be fetched.</param>
    /// <returns>A task representing the asynchronous operation, with a response containing the list of fine-tuning history records.</returns>
    Task<ServiceResponse<IEnumerable<FineTuningHistoryDto>>> GetFineTuningDataHistoriesAsync(Guid mlModelId);

    /// <summary>
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