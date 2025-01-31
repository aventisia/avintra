namespace MLModelBuilderAPIs.Services;

public interface IMLModelService
{
    /// <summary>
    /// Gets a list of ML models
    /// </summary>
    /// <returns>A list of ML models</returns>
    Task<ServiceResponse<IEnumerable<MLModelDto>>> GetMLModelListAsync();

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
    Task<ServiceResponse<MLModelDto>> GetMLModelByIdAsync(Guid id);
}