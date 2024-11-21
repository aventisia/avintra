namespace WorkspaceAPIs.Services;
public interface IFlowTemplateService
{
 /// <summary>
    /// Creates a new flow template
    /// </summary>
    /// <param name="flowTemplateDto">Message composer submitted data</param>
    /// <returns>Returns newly created flow comment</returns>
    Task<ServiceResponse<FlowTemplateDto>> CreateFlowTemplateAsync(FlowTemplateDto flowTemplateDto);

    Task<ServiceResponse<FlowTemplateDto>> GetFlowTemplateAsync (Guid TemplateId);

    Task<ServiceResponse<IEnumerable<FlowTemplateDto>>> GetTrendingTemplatesAsync();
}