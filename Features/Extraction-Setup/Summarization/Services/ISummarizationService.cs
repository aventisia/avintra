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
}