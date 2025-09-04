namespace WorkspaceAPIs.Controllers;

[Route("template")]
[ApiController]
public class ExternalTemplateController : BaseApiController
{
    private readonly IExternalTemplateService _externalTemplateService;

    public ExternalTemplateController(IExternalTemplateService ExternalTemplateService)
    {
        _externalTemplateService = ExternalTemplateService;
    }

    // Fetch template by its ID
    [HttpGet("{projectTemplateId}")]
    public async Task<ActionResult<ServiceResponse<ProjectTemplateDto>>> GetProjectTemplate(Guid projectTemplateId)
    {
        return ResultHelper(await _externalTemplateService.GetTemplateAsync(projectTemplateId));
    }

    // Search project templates based on the provided search key
    [HttpGet("search/{searchKey}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchProjectTemplateDto>>>> SearchTemplates(string searchKey)
    {
        return ResultHelper(await _externalTemplateService.SearchTemplatesAsync(searchKey));
    }

    // Retrieves all trending project templates
    [HttpGet("trending")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TrendingTemplateDto>>>> GetAllTrendingTemplatesAsync()
    {
        return ResultHelper(await _externalTemplateService.GetAllTrendingTemplatesAsync());
    }
}
