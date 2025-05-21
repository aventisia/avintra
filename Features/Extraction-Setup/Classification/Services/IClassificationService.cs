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
}