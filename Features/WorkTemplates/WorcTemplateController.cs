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
    [HttpPost("publish-flow-template/{flowVersionId}")]
    public async Task<ActionResult<ServiceResponse<WorcTemplateDto>>> PublishFlowAsTemplate(Guid flowVersionId)
    {
        return ResultHelper(await _worcTemplateService.PublishWorcTemplateAsync(flowVersionId));
    }

    // Fetch Worc template by its ID
    [HttpGet("{templateId}")]
    public async Task<ActionResult<ServiceResponse<WorcTemplateDto>>> GetWorcTemplate(Guid templateId)
    {
        return ResultHelper(await _worcTemplateService.GetWorcTemplateAsync(templateId));
    }

    // Fetch trending Worc templates
    [HttpGet("trending-templates")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TrendingWorcTemplateDto>>>> GetTrendingTemplates()
    {
        return ResultHelper(await _worcTemplateService.GetTrendingTemplatesAsync());
    }

    // Retrieve Worc templates by category and search query
    [HttpGet("templates-category-by-name")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<WorcTemplateCategoryBySearchQueryDto>>>> GetWorcTemplateCategoryBySearchQuery(CategoryTypesEnum Type, string Name)
    {
        return ResultHelper(await _worcTemplateService.GetWorcTemplateCategoryBySearchQueryAsync(Type, Name));
    }

    // Searches flow versions by flow name, with an option to include unpublished versions.
    [HttpGet("search/{searchKey}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchWorcTemplateDto>>>> SearchTemplates(string searchKey)
    {
        return ResultHelper(await _worcTemplateService.SearchTemplatesAsync(searchKey));
    }
}
