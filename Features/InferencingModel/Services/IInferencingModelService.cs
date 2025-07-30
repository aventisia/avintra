namespace MLModelBuilderAPIs.Services;

public interface IInferencingModelService
{
    /// <summary>
    /// Gets the model setup for a specific inferencing model using its unique ML model ID.
    /// </summary>
    /// <param name="mlModelId">The unique ID of the ML model to fetch the setup for.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the model setup DTO for the specified ML model.</returns>
    Task<ServiceResponse<InferencingModelDto>> GetSetupByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Updates the configuration for an inferencing model setup.
    /// </summary>
    /// <param name="modelSetupDto">The new setup configuration to be applied to the inferencing model.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the updated model setup DTO.</returns>
    Task<ServiceResponse<InferencingModelDto>> UpdateSetupAsync(InferencingModelDto modelSetupDto);

    /// <summary>
    /// Executes a request against a Large Language Model (LLM) using the provided model execution request data.
    /// </summary>
    /// <param name="modelExecutionRequestDto">The model execution request containing the input parameters for the LLM.</param>
    /// <returns>
    /// A task that represents the asynchronous operation, containing a <see cref="ServiceResponse{ExtractionResponseDto}"/> 
    /// with the extraction result from the LLM.
    /// </returns>
    Task<ServiceResponse<InferencingModelResponseDto>> ExecuteLLMByFileIdsAsync(ModelFileProcessingRequestDto modelExecutionRequestDto);

    /// <summary>
    /// Executes a model using the provided file content for data extraction.
    /// </summary>
    /// <remarks>
    /// This method processes the model tasks by sending the provided content to the model, 
    /// extracts data, and returns the results along with any errors or status updates. 
    /// It logs detailed information about the execution process, including success and failure scenarios.
    /// </remarks>
    /// <param name="modelExecutionRequestDto">The DTO containing the model ID, optional task ID, and content for extraction.</param>
    /// <returns>A service response containing the extracted data and status of the execution.</returns>
    Task<ServiceResponse<InferencingModelResponseDto>> ExecuteLLMByFileContentAsync(ModelContentProcessingRequestDto modelExecutionRequestDto);

    /// <summary>
    /// Gets the extracted data list linked to a specific machine learning model asynchronously.
    /// </summary>
    /// <param name="mlModelId">The ID of the machine learning model.</param>
    /// <returns>
    /// A task that returns a service response containing a list of 
    /// <see cref="InferencingModelExtractedDataDetailDto"/> records.
    /// </returns>
    Task<ServiceResponse<IEnumerable<InferencingModelExtractedDataDetailDto>>> GetExtractedDataByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Updates an extracted data record for a machine learning model.
    /// </summary>
    /// <param name="inferencingModelExtractedDataDetailDto">The data to be updated.</param>
    /// <returns>A task that returns a success flag.</returns>
    Task<ServiceResponse<bool>> UpdateExtractedDataAsync(InferencingModelExtractedDataDetailDto inferencingModelExtractedDataDetailDto);
}