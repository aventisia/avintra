namespace WorkspaceAPIs.Controllers;

[Route("flow-template")]
[ApiController]
[Authorize]
public class FlowTemplateController : BaseApiController
{
    private readonly IFlowTemplateService _flowTemplateService;

    public FlowTemplateController(IFlowTemplateService flowTemplateService)
    {
        _flowTemplateService = flowTemplateService;
    }

    // Create a new flow template
    [HttpPost("create-template")]
    public async Task<ActionResult<ServiceResponse<FlowTemplateDto>>> InsertFlowTemplate([FromBody] FlowTemplateDto flowTemplateDto)
    {
        return ResultHelper(await _flowTemplateService.InsertFlowTemplateAsync(flowTemplateDto));
    }

    // Create publish flow as a template
    [HttpPost("publish-flow-template/{flowId}")]
    public async Task<ActionResult<ServiceResponse<FlowTemplateDto>>> PublishFlowAsTemplate(Guid flowId)
    {
      return ResultHelper(await _flowTemplateService.PublishFlowAsTemplateAsync(flowId));  
    }

    // Fetching flow template by its ID.
    [HttpGet("{TemplateId}")]
    public async Task<ActionResult<ServiceResponse<FlowTemplateDto>>> GetFlowTemplate(Guid TemplateId)
    {
        return ResultHelper(await _flowTemplateService.GetFlowTemplateAsync(TemplateId));
    }

    // Fetching trending templates list
    [HttpGet("trending-templates")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TrendingFlowTemplateDto>>>> GetTrendingTemplates()
    {
        return ResultHelper(await _flowTemplateService.GetTrendingTemplatesAsync());
    }

    // Retrive template list based on category and search query
    [HttpGet("templates-category-by-name")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<FlowTemplateCategoryBySearchQueryDto>>>> GetFlowTemplateCategoryBySearchQuery(CategoryTypesEnum Type,string Name)
    {
        return ResultHelper(await _flowTemplateService.GetFlowTemplateCategoryBySearchQueryAsync(Type,Name));
    }

}