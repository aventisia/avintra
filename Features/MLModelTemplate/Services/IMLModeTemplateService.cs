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
    /// Publishes a new machine learning model template.
    /// </summary>
    /// <param name="publishMLModelTemplateDto">The DTO containing the template information.</param>
    /// <returns>A service response with the published ML model template details.</returns>
    Task<ServiceResponse<MLModelTemplateDto>> PublishMLModelTemplateAsync(PublishMLModelTemplateDto publishMLModelTemplateDto);

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
    /// Deletes multiple ML model templates based on the provided unique IDs.
    /// </summary>
    /// <param name="mlModelTemplateIds">A list of template IDs to be deleted.</param>
    /// <returns>A service response indicating whether the deletion of all templates was successful.</returns>
    Task<ServiceResponse<bool>> DeleteMultipleMLModelTemplatesAsync(IEnumerable<Guid> mlModelTemplateIds);

    /// <summary>
    /// Fetches a list of currently trending ML model templates.
    /// </summary>
    /// <returns>A task that returns a service response containing a paginated collection of trending ML model templates.</returns>
    Task<ServiceResponse<PaginationDto<TrendingTemplateDto>>> GetTrendingMLModelTemplatesAsync(int pageNo, int pageSize);

    /// <summary>
    /// Creates a new machine learning (ML) model by utilizing a selected trending ML model template.
    /// </summary>
    /// <param name="trendingTemplateDto">The trending ML model template to be used for creating the new ML model.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a service response indicating whether the ML model creation was successful.
    /// </returns>
    Task<ServiceResponse<TrendingTemplateDto>> UseTemplateToCreateMLModelAsync(TrendingTemplateDto trendingTemplateDto);
}
