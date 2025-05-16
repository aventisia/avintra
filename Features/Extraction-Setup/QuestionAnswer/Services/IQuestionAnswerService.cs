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
}