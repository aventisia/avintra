namespace WorkspaceAPIs.Controllers;

[Route("api/template")]
[ApiController]
public class PublicTemplateController : BaseApiController
{
    private readonly IPublicTemplateService _publicTemplateService;

    public PublicTemplateController(IPublicTemplateService PublicTemplateService)
    {
        _publicTemplateService = PublicTemplateService;
    }

    // Fetch template by its ID
    [HttpGet()]
    public async Task<ActionResult<ServiceResponse<ProjectTemplateDto>>> GetProjectTemplate([FromQuery] Guid Ptid)
    {
        return ResultHelper(await _publicTemplateService.GetTemplateAsync(Ptid));
    }

    // Search project templates based on the provided search key
    [HttpGet("search")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchProjectTemplateDto>>>> SearchTemplates([FromQuery] string key)
    {
        return ResultHelper(await _publicTemplateService.SearchTemplatesAsync(key));
    }

    // Retrieves all trending project templates
    [HttpGet("trending")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TrendingTemplateDto>>>> GetAllTrendingTemplatesAsync()
    {
        return ResultHelper(await _publicTemplateService.GetAllTrendingTemplatesAsync());
    }
}
