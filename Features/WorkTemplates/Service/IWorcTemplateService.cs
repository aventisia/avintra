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
    /// <param name="publishTemplateDto">The DTO containing the details of the flow version to be published as a WORC template.</param>
    /// <returns>Returns the newly created published flow as a Worc template</returns>
    Task<ServiceResponse<WorcTemplateDto>> PublishWorcTemplateAsync(PublishTemplateDto publishTemplateDto);

    /// <summary>
    /// Retrieves a Worc template.
    /// </summary>
    /// <param name="id">The ID of the Worc template</param>
    /// <returns>The task result contains the service response with the Worc template.</returns>
    Task<ServiceResponse<WorcTemplateDto>> GetWorcTemplateAsync(Guid id);

    /// <summary>
    /// Retrieves a list of Worc templates.
    /// </summary>
    /// <returns>The task result contains the service response with the list of Worc templates.</returns>
    Task<ServiceResponse<IEnumerable<WorcTemplateDto>>> GetAllTemplatesAsync();

    /// <summary>
    /// Retrieves a list of Worc template categories by search query.
    /// </summary>
    /// <param name="type">The category type</param>
    /// <param name="name">The search query for template name</param>
    /// <returns>The task result contains the service response with the list of Worc template categories by search query.</returns>
    Task<ServiceResponse<IEnumerable<WorcTemplateCategoryBySearchQueryDto>>> GetWorcTemplateCategoryBySearchQueryAsync(FlowTypesEnum type, string name);

    /// <summary>
    /// Searches for Worc templates that match the given search key.
    /// </summary>
    /// <param name="searchKey">The keyword to search for in the template data.</param>
    /// <returns>A task containing a service response with a collection of matching Worc templates.</returns>
    Task<ServiceResponse<IEnumerable<SearchWorcTemplateDto>>> SearchTemplatesAsync(string searchKey);

    /// <summary>
    /// Retrieves a collection of trending Worc templates.
    /// </summary>
    /// <returns>A task containing a service response with the list of trending Worc templates.</returns>
    Task<ServiceResponse<IEnumerable<TrendingTemplateDto>>> GetAllTrendingTemplatesAsync();

    /// <summary>
    /// Creates a new flow by utilizing a selected trending Worc template.
    /// </summary>
    /// <param name="trendingTemplateDto">The trending Worc template that will be used to create the flow.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a service response indicating the success or failure of the operation.</returns>
    Task<ServiceResponse<TrendingTemplateDto>> UseTemplateToCreateFlowAsync(TrendingTemplateDto trendingTemplateDto);
}