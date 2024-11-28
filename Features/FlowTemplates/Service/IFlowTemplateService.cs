namespace WorkspaceAPIs.Services;
public interface IFlowTemplateService
{
 /// <summary>
    /// Creates a new flow template
    /// </summary>
    /// <param name="flowTemplateDto">Message composer submitted data</param>
    /// <returns>Returns newly created flow template</returns>
    Task<ServiceResponse<FlowTemplateDto>> CreateFlowTemplateAsync(FlowTemplateDto flowTemplateDto);

    /// <summary>
    /// Retrieves flow template
    /// </summary>
    /// <param name="TemplateId">Message composer submitted data</param>
    /// <returns>The task result contains the service response with flow template.</returns>

    Task<ServiceResponse<FlowTemplateDto>> GetFlowTemplateAsync (Guid TemplateId);

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

    Task<ServiceResponse<IEnumerable<FlowTemplateCategoryBySearchQueryDto>>> GetFlowTemplateCategoryBySearchQueryAsync(string Category,string Name);
}