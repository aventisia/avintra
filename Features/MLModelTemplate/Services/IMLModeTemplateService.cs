namespace MLModelBuilderAPIs.Services;

public interface IMLModelTemplateService
{
    /// <summary>
    /// Retrieves all ML model templates, optionally filtered by a specific ML model ID.
    /// </summary>
    /// <returns>A task that returns a service response containing a collection of ML model templates.</returns>
    Task<ServiceResponse<IEnumerable<MLModelTemplateDto>>> GetAllMLModelTemplatesAsync();

    /// <summary>
    /// Retrieves a single ML model template by its unique identifier.
    /// </summary>
    /// <param name="mlModelTemplateId">The unique identifier of the ML model template.</param>
    /// <returns>A service response containing the requested ML model template.</returns>
    Task<ServiceResponse<MLModelTemplateDto>> GetMLModelTemplateByIdAsync(Guid mlModelTemplateId);

    /// <summary>
    /// Creates a new ML model template.
    /// </summary>
    /// <param name="mlModelTemplateDto">The data transfer object with template details.</param>
    /// <returns>A service response containing the created ML model template.</returns>
    Task<ServiceResponse<MLModelTemplateDto>> CreateMLModelTemplateAsync(MLModelTemplateDto mlModelTemplateDto);

    /// <summary>
    /// Updates an existing ML model template.
    /// </summary>
    /// <param name="mlModelTemplateDto">The data transfer object with updated template details.</param>
    /// <returns>A service response containing the updated ML model template.</returns>
    Task<ServiceResponse<MLModelTemplateDto>> UpdateMLModelTemplateAsync(MLModelTemplateDto mlModelTemplateDto);

    /// <summary>
    /// Deletes a ML model template identified by its unique ID.
    /// </summary>
    /// <param name="mlModelTemplateId">The unique identifier of the ML model template to delete.</param>
    /// <returns>A service response indicating success or failure of the deletion.</returns>
    Task<ServiceResponse<bool>> DeleteMLModelTemplateAsync(Guid mlModelTemplateId);

    /// <summary>
    /// Deletes multiple ML model templates specified by their unique IDs.
    /// </summary>
    /// <param name="mlModelTemplateIds">A collection of template IDs to be deleted.</param>
    /// <returns>A service response indicating whether all deletions succeeded.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleMLModelTemplatesAsync(IEnumerable<Guid> mlModelTemplateIds);

    /// <summary>
    /// Retrieves a list of trending ML model templates.
    /// </summary>
    /// <returns>A task that returns a service response containing a collection of trending ML model templates.</returns>
    Task<ServiceResponse<IEnumerable<MLModelTemplateDto>>> GetTrendingMLModelTemplatesAsync();
}
