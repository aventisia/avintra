namespace WorkspaceAPIs.Controllers;

[Route("flow-template")]
[ApiController]
[Authorize]
public class WorcTemplateController : BaseApiController
{
    private readonly IWorcTemplateService _worcTemplateService;

    public WorcTemplateController(IWorcTemplateService worcTemplateService)
    {
        _worcTemplateService = worcTemplateService;
    }

    // Create a new Worc template
    [HttpPost("create-template")]
    public async Task<ActionResult<ServiceResponse<WorcTemplateDto>>> InsertWorcTemplate([FromBody] WorcTemplateDto worcTemplateDto)
    {
        return ResultHelper(await _worcTemplateService.InsertWorcTemplateAsync(worcTemplateDto));
    }

    // Publish a flow as a Worc template
    [HttpPost("publish")]
    public async Task<ActionResult<ServiceResponse<WorcTemplateDto>>> PublishFlowAsTemplate(PublishTemplateDto publishTemplateDto)
    {
        return ResultHelper(await _worcTemplateService.PublishWorcTemplateAsync(publishTemplateDto));
    }

    // Fetch Worc template by its ID
    [HttpGet("{templateId}")]
    public async Task<ActionResult<ServiceResponse<WorcTemplateDto>>> GetWorcTemplate(Guid templateId)
    {
        return ResultHelper(await _worcTemplateService.GetWorcTemplateAsync(templateId));
    }

    // Fetch trending Worc templates
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TrendingTemplateDto>>>> GetTrendingTemplates()
    {
        return ResultHelper(await _worcTemplateService.GetAllTemplatesAsync());
    }

    // Retrieve Worc templates by category and search query
    [HttpGet("templates-category-by-name")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<WorcTemplateCategoryBySearchQueryDto>>>> GetWorcTemplateCategoryBySearchQuery(FlowTypesEnum type, string Name)
    {
        return ResultHelper(await _worcTemplateService.GetWorcTemplateCategoryBySearchQueryAsync(type, Name));
    }

    // Searches Worc templates based on the provided search key.
    [HttpGet("search/{searchKey}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchWorcTemplateDto>>>> SearchTemplates(string searchKey)
    {
        return ResultHelper(await _worcTemplateService.SearchTemplatesAsync(searchKey));
    }

    // Retrieves all trending Worc templates.
    [HttpGet("trending")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchWorcTemplateDto>>>> GetAllTrendingTemplatesAsync()
    {
        return ResultHelper(await _worcTemplateService.GetAllTrendingTemplatesAsync());
    }

    // Creates a new flow using the selected trending Worc template.
    [HttpPost("use")]
    public async Task<ActionResult<ServiceResponse<TrendingTemplateDto>>> UseTemplateToCreateFlow([FromBody] TrendingTemplateDto trendingTemplateDto)
    {
        return ResultHelper(await _worcTemplateService.UseTemplateToCreateFlowAsync(trendingTemplateDto));
    }
}
