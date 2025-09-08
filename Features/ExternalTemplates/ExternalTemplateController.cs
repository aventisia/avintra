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
    [HttpGet()]
    public async Task<ActionResult<ServiceResponse<ProjectTemplateDto>>> GetProjectTemplate([FromQuery] Guid Ptid)
    {
        return ResultHelper(await _externalTemplateService.GetTemplateAsync(Ptid));
    }

    // Search project templates based on the provided search key
    [HttpGet("search")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchProjectTemplateDto>>>> SearchTemplates([FromQuery] string key)
    {
        return ResultHelper(await _externalTemplateService.SearchTemplatesAsync(key));
    }

    // Retrieves all trending project templates
    [HttpGet("trending")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TrendingTemplateDto>>>> GetAllTrendingTemplatesAsync()
    {
        return ResultHelper(await _externalTemplateService.GetAllTrendingTemplatesAsync());
    }
}
