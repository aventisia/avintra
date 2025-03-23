namespace MLModelBuilderAPIs.Services;

public interface IMLModelService
{
    /// <summary>
    /// Retrieves all models created by the user.
    /// </summary>
    /// <returns>The task result contains the service response with the list of models details.</returns>
    Task<ServiceResponse<IEnumerable<MLModelDto>>> GetMLModelListAsync();

    /// <summary>
    /// Checks the availability of a model name.
    /// </summary>
    /// <param name="checkAvailabilityDto">The DTO containing the model name to check.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a <see cref="ServiceResponse{T}"/> object with a <see cref="TrueFalseResultDto"/> indicating whether the model name is available or not.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsMLModelNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);
    
    /// <summary>
    /// Inserts a ML model
    /// </summary>
    /// <param name="mlModelDto">ML Model Dto</param>
    /// <returns>A new model library</returns>
    Task<ServiceResponse<MLModelDto>> InsertMLModelAsync(MLModelDto mlModelDto);

    /// <summary>
    /// Updates a ML model
    /// </summary>
    /// <param name="mlModelDto">ML Model Dto</param>
    /// <returns>An updated ML model</returns>
    Task<ServiceResponse<MLModelDto>> UpdateMLModelAsync(MLModelDto mlModelDto);

    /// <summary>
    /// Deletes a ML model
    /// </summary>
    /// <param name="id">Id</param>
    /// <returns>True, if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteMLModelAsync(Guid id);

    /// <summary>
    /// Get a ML model by ML model identifier
    /// </summary>
    /// <param name="id">Id</param>
    /// <returns>A ML model with specific identifier</returns>
    Task<ServiceResponse<MLModelDto>> GetMLModelByIdAsync(Guid modelId);
}