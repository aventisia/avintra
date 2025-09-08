namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides methods for managing public templates, including retrieving, searching, and identifying trending templates.
/// </summary>
public interface IPublicTemplateService
{
    /// <summary>
    /// Retrieves a template using its unique identifier.
    /// </summary>
    /// <param name="templateId">The unique identifier of the template to retrieve.</param>
    /// <returns>A service response containing the template data if found, or an error message if not.</returns>
    Task<ServiceResponse<ProjectTemplateDto>> GetTemplateAsync(Guid templateId);

    /// <summary>
    /// Searches for templates based on a specified keyword.
    /// </summary>
    /// <param name="searchKey">The keyword to search for in template data (name, description, etc.).</param>
    /// <returns>A service response containing a list of templates that match the search keyword, or an error message if no match is found.</returns>
    Task<ServiceResponse<IEnumerable<SearchProjectTemplateDto>>> SearchTemplatesAsync(string searchKey);

    /// <summary>
    /// Retrieves a list of trending templates based on popularity or other relevant metrics.
    /// </summary>
    /// <returns>A service response containing a list of trending templates, or an error message if no templates are found.</returns>
    Task<ServiceResponse<IEnumerable<TrendingTemplateDto>>> GetAllTrendingTemplatesAsync();

    /// <summary>
    /// Retrieves all project templates that are pending approval.
    /// </summary>
    /// <returns>A list of project templates that are pending approval.</returns>
    Task<ServiceResponse<IEnumerable<ProjectTemplateDto>>> GetAllPendingApprovalProjectTemplatesAsync();
}