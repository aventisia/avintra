namespace WorkspaceAPIs.Controllers;

[Route("project-template")]
[ApiController]
[Authorize]
public class ProjectTemplateController : BaseApiController
{
    private readonly IProjectTemplateService _projectTemplateService;

    public ProjectTemplateController(IProjectTemplateService projectTemplateService)
    {
        _projectTemplateService = projectTemplateService;
    }

    // Fetch all project templates
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ProjectTemplateDto>>>> GetAllTemplates()
    {
        return ResultHelper(await _projectTemplateService.GetAllProjectTemplatesAsync());
    }

    // Fetch project template by its ID
    [HttpGet("{projectTemplateId}")]
    public async Task<ActionResult<ServiceResponse<ProjectTemplateDto>>> GetProjectTemplate(Guid projectTemplateId)
    {
        return ResultHelper(await _projectTemplateService.GetProjectTemplateAsync(projectTemplateId));
    }

    // Fetch project template by ref id
    [HttpGet("reference/{refId}")]
    public async Task<ActionResult<ServiceResponse<ProjectTemplateDto>>> GetProjectTemplateByRefId(Guid refId)
    {
        return ResultHelper(await _projectTemplateService.GetProjectTemplateByRefIdAsync(refId));
    }

    // Create a new project template
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ProjectTemplateDto>>> InsertProjectTemplate([FromBody] ProjectTemplateDto projectTemplateDto)
    {
        return ResultHelper(await _projectTemplateService.InsertProjectTemplateAsync(projectTemplateDto));
    }

    // Update an existing project template
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ProjectTemplateDto>>> UpdateProjectTemplate([FromBody] ProjectTemplateDto projectTemplateDto)
    {
        return ResultHelper(await _projectTemplateService.UpdateProjectTemplateAsync(projectTemplateDto));
    }

    // Delete a project template by ID
    [HttpDelete("{projectTemplateId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteProjectTemplate(Guid projectTemplateId)
    {
        return ResultHelper(await _projectTemplateService.DeleteProjectTemplateAsync(projectTemplateId));
    }

    // Delete multiple project templates by IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteProjectTemplates([FromBody] IEnumerable<Guid> projectTemplateIds)
    {
        return ResultHelper(await _projectTemplateService.DeleteProjectTemplatesAsync(projectTemplateIds));
    }

    // Retrieves all project templates that are pending approval
    [HttpGet("pending-approval")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ProjectTemplateDto>>>> GetAllPendingApprovalTemplatesAsync()
    {
        return ResultHelper(await _projectTemplateService.GetAllPendingApprovalProjectTemplatesAsync());
    }

    // Approve or reject a project template
    [HttpPut("status")]
    public async Task<ActionResult<ServiceResponse<ProjectTemplateDto>>> UpdateTemplateStatus([FromBody] ProjectTemplateDto projectTemplateDto)
    {
        return ResultHelper(await _projectTemplateService.UpdateTemplateStatusAsync(projectTemplateDto));
    }


    // Publish a project template
    [HttpPost("publish")]
    public async Task<ActionResult<ServiceResponse<ProjectTemplateDto>>> PublishProjectTemplate([FromBody] PublishProjectTemplateDto publishProjectTemplateDto)
    {
        return ResultHelper(await _projectTemplateService.PublishProjectTemplateAsync(publishProjectTemplateDto));
    }

    // Search project templates based on the provided search key
    [HttpGet("search/{searchKey}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchProjectTemplateDto>>>> SearchTemplates(string searchKey)
    {
        return ResultHelper(await _projectTemplateService.SearchProjectTemplatesAsync(searchKey));
    }

    // Retrieves all trending project templates
    [HttpGet("trending")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TrendingTemplateDto>>>> GetAllTrendingTemplatesAsync()
    {
        return ResultHelper(await _projectTemplateService.GetAllTrendingProjectTemplatesAsync());
    }

    // Creates a new flow using the selected trending Project template
    [HttpPost("use")]
    public async Task<ActionResult<ServiceResponse<TrendingTemplateDto>>> UseTemplateToCreateFlow([FromBody] TrendingTemplateDto trendingTemplateDto)
    {
        return ResultHelper(await _projectTemplateService.UseProjectTemplateAsync(trendingTemplateDto));
    }

    // Generates a new template via LLM based on the provided template data
    [HttpPost("generate")]
    public async Task<ActionResult<ServiceResponse<string>>> GenerateTemplateUsingLLM([FromBody] ProjectTemplateDto projectTemplateDto)
    {
        return ResultHelper(await _projectTemplateService.GenerateTemplateUsingLLMAsync(projectTemplateDto));
    }
}
