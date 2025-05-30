namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Defines the contract for a service that handles operations related to 
/// QuestionAnswer configurations used in machine learning models.
/// </summary>
public interface IQuestionAnswerService
{
    /// <summary>
    /// Updates an existing QuestionAnswer configuration for a machine learning model.
    /// Accepts a <paramref name="QuestionAnswerDto"/> containing the updated setup data 
    /// and returns the resulting configuration after the update.
    /// </summary>
    /// <param name="QuestionAnswerDto">The DTO containing updated QuestionAnswer configuration data.</param>
    /// <returns>
    /// A task representing the asynchronous update operation. 
    /// The result includes a service response with the updated QuestionAnswer configuration.
    /// </returns>
    Task<ServiceResponse<QuestionAnswerDto>> UpdateQuestionAnswerSetupAsync(QuestionAnswerDto QuestionAnswerDto);

    /// <summary>
    /// Retrieves the QuestionAnswer configuration associated with a specific machine learning model ID.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the target machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous retrieval operation. 
    /// The result includes a service response with the corresponding QuestionAnswer configuration.
    /// </returns>
    Task<ServiceResponse<QuestionAnswerDto>> GetQuestionAnswerSetupByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Extracts data asynchronously using a Language Learning Model (LLM).
    /// </summary>
    /// <param name="extractRequestDto">The data transfer object containing the parameters for the extraction process.</param>
    /// <returns>
    /// An asynchronous task that returns a service response containing an enumeration of extraction response DTOs.
    /// </returns>
    Task<ServiceResponse<QuestionAnswerResponseDto>> ExtractViaLLMAsync(ExtractRequestDto extractRequestDto);

    /// <summary>
    /// Asynchronously retrieves a list of extracted data records linked to a specific machine learning model.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation, with a result containing a service response
    /// that includes a collection of <see cref="QuestionAnswerExtractedDataDto"/> objects.
    /// </returns>
    Task<ServiceResponse<IEnumerable<QuestionAnswerExtractedDataDto>>> GetExtractedDataByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Asynchronously retrieves a list of extracted review data records associated with a specific machine learning model.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation, containing a service response with a collection of <see cref="QuestionAnswerReviewDataDto"/> objects.
    /// </returns>
    Task<ServiceResponse<IEnumerable<QuestionAnswerReviewDataDto>>> GetExtractedReviewDataByMLModelIdAsync(Guid mlModelId);


    /// <summary>
    /// Updates an extracted review data record associated with a specific machine learning model.
    /// </summary>
    /// <param name="questionAnswerExtractedDataDto">The DTO containing the updated review data information.</param>
    /// <returns>A service response containing the updated review data record.</returns>
    Task<ServiceResponse<QuestionAnswerExtractedDataDto>> UpdateExtractedReviewDataAsync(QuestionAnswerExtractedDataDto questionAnswerExtractedDataDto);

    /// <summary>
    /// Adds new model review data based on the provided request DTO.
    /// </summary>
    /// <param name="createModelReviewRequestDto">The data transfer object containing the review information to be added.</param>
    /// <returns>
    /// A task that represents the asynchronous operation. The task result contains a ServiceResponse with a collection of QuestionAnswerReviewDataDto representing the added or affected review data.
    /// </returns>
    Task<ServiceResponse<IEnumerable<QuestionAnswerReviewDataDto>>> AddReviewDataAsync(CreateModelReviewRequestDto createModelReviewRequestDto);
}