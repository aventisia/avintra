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
}
