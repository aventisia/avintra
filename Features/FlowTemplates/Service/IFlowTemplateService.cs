namespace WorkspaceAPIs.Services;
public interface IFlowTemplateService
{
    /// <summary>
    /// Creates a new flow template
    /// </summary>
    /// <param name="flowTemplateDto">Message composer submitted data</param>
    /// <returns>Returns newly created flow template</returns>
    Task<ServiceResponse<FlowTemplateDto>> InsertFlowTemplateAsync(FlowTemplateDto flowTemplateDto);

    /// <summary>
    /// Creates a new publish flow as a template
    /// </summary>
    /// <param name="flowTemplateDto">Message composer submitted data</param>
    /// <returns>Returns newly created publish flow as a template</returns>
    Task<ServiceResponse<FlowTemplateDto>> PublishFlowAsTemplateAsync (Guid flowId);

    /// <summary>
    /// Retrieves flow template
    /// </summary>
    /// <param name="Id">Message composer submitted data</param>
    /// <returns>The task result contains the service response with flow template.</returns>

    Task<ServiceResponse<FlowTemplateDto>> GetFlowTemplateAsync (Guid Id);

    /// <summary>
    /// Retrieves list of trending templates.
    /// </summary>
    /// <returns>The task result contains the service response with the list of trending templates</returns>
    Task<ServiceResponse<IEnumerable<TrendingFlowTemplateDto>>> GetTrendingTemplatesAsync();

    /// <summary>
    /// Retrieves list of flow template category by search query.
    /// </summary>
    /// <param name="Category Name">Message composer submitted data</param>
    /// <returns>The task result contains the service response with the list of flow template category by search query.</returns>

    Task<ServiceResponse<IEnumerable<FlowTemplateCategoryBySearchQueryDto>>> GetFlowTemplateCategoryBySearchQueryAsync(CategoryTypesEnum Type ,string Name);
}