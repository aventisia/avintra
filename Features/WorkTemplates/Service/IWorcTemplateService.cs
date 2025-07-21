namespace WorkspaceAPIs.Services;

public interface IWorcTemplateService
{
    /// <summary>
    /// Creates a new Worc template.
    /// </summary>
    /// <param name="worcTemplateDto">Message composer submitted data</param>
    /// <returns>Returns the newly created Worc template</returns>
    Task<ServiceResponse<WorcTemplateDto>> InsertWorcTemplateAsync(WorcTemplateDto worcTemplateDto);

    /// <summary>
    /// Creates a new published flow as a Worc template.
    /// </summary>
    /// <param name="flowId">The flow ID to be published as a template</param>
    /// <returns>Returns the newly created published flow as a Worc template</returns>
    Task<ServiceResponse<WorcTemplateDto>> PublishWorcTemplateAsync(Guid flowId);

    /// <summary>
    /// Retrieves a Worc template.
    /// </summary>
    /// <param name="id">The ID of the Worc template</param>
    /// <returns>The task result contains the service response with the Worc template.</returns>
    Task<ServiceResponse<WorcTemplateDto>> GetWorcTemplateAsync(Guid id);

    /// <summary>
    /// Retrieves a list of trending Worc templates.
    /// </summary>
    /// <returns>The task result contains the service response with the list of trending Worc templates.</returns>
    Task<ServiceResponse<IEnumerable<TrendingWorcTemplateDto>>> GetTrendingTemplatesAsync();

    /// <summary>
    /// Retrieves a list of Worc template categories by search query.
    /// </summary>
    /// <param name="type">The category type</param>
    /// <param name="name">The search query for template name</param>
    /// <returns>The task result contains the service response with the list of Worc template categories by search query.</returns>
    Task<ServiceResponse<IEnumerable<WorcTemplateCategoryBySearchQueryDto>>> GetWorcTemplateCategoryBySearchQueryAsync(CategoryTypesEnum type, string name);

    Task<ServiceResponse<IEnumerable<SearchWorcTemplateDto>>> SearchTemplatesAsync(string searchKey);

}