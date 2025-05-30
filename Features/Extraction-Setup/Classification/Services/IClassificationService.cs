namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Defines operations for managing classification configurations 
/// associated with machine learning models.
/// </summary>
public interface IClassificationService
{
    /// <summary>
    /// Updates the classification setup for a specified machine learning model.
    /// Applies changes based on the provided <paramref name="classificationDto"/> and returns the updated configuration.
    /// </summary>
    /// <param name="classificationDto">The data transfer object containing the updated classification setup details.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result is a service response 
    /// containing the updated classification configuration.
    /// </returns>
    Task<ServiceResponse<ClassificationDto>> UpdateClassificationSetupAsync(ClassificationDto classificationDto);

    /// <summary>
    /// Retrieves the classification setup associated with a specific machine learning model ID.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result is a service response 
    /// containing the classification configuration tied to the given model ID.
    /// </returns>
    Task<ServiceResponse<ClassificationDto>> GetClassificationSetupByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Extracts data asynchronously using a Language Learning Model (LLM).
    /// </summary>
    /// <param name="extractRequestDto">The data transfer object containing the parameters required for the extraction process.</param>
    /// <returns>
    /// An asynchronous task that returns a service response with a collection of extraction response DTOs.
    /// </returns>
    Task<ServiceResponse<ClassificationResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto);

    /// <summary>
    /// Asynchronously retrieves a list of extracted data records linked to a specific machine learning model.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation, with a result containing a service response
    /// that includes a collection of <see cref="ClassificationExtractedDataDto"/> objects.
    /// </returns>
    Task<ServiceResponse<IEnumerable<ClassificationExtractedDataDto>>> GetExtractedDataByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Asynchronously retrieves a list of extracted review data records associated with a specific machine learning model.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation, containing a service response with a collection of <see cref="ClassificationReviewDataDto"/> objects.
    /// </returns>
    Task<ServiceResponse<IEnumerable<ClassificationReviewDataDto>>> GetExtractedReviewDataByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Updates an extracted review data record associated with a specific machine learning model.
    /// </summary>
    /// <param name="classificationExtractedDataDto">The DTO containing the updated review data information.</param>
    /// <returns>A service response containing the updated review data record.</returns>
    Task<ServiceResponse<ClassificationExtractedDataDto>> UpdateExtractedReviewDataAsync(ClassificationExtractedDataDto classificationExtractedDataDto);

    /// <summary>
    /// Adds new model review data based on the provided request DTO.
    /// </summary>
    /// <param name="createModelReviewRequestDto">The data transfer object containing the review information to be added.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains a ServiceResponse with a collection of createModelReviewRequestDto representing the added or affected review data.
    /// </returns>
    Task<ServiceResponse<IEnumerable<ClassificationReviewDataDto>>> AddReviewDataAsync(CreateModelReviewRequestDto createModelReviewRequestDto);
}