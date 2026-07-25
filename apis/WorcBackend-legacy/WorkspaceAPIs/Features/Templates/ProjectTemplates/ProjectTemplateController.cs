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
    public async Task<ActionResult<ServiceResponse<IEnumerable<ProjectTemplateDto>>>> GetAllTemplates([FromQuery] ProjectTemplateTypesEnum? type = null)
    {
        return ResultHelper(await _projectTemplateService.GetAllProjectTemplatesAsync(type));
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
    [Authorize(Roles = "TA")]
    [HttpGet("pending-approval")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ProjectTemplateDto>>>> GetAllPendingApprovalTemplatesAsync()
    {
        return ResultHelper(await _projectTemplateService.GetTenantPendingApprovalProjectTemplatesAsync());
    }

    // Returns all shared (public) project templates that are awaiting approval.
    [Authorize(Roles = "SA")]
    [HttpGet("shared/pending-approval")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ProjectTemplateDto>>>> GetPublicPendingApprovalTemplatesAsync()
    {
        return ResultHelper(await _projectTemplateService.GetPublicPendingApprovalProjectTemplatesAsync());
    }

    // Approve or reject a project template
    [Authorize(Roles = "SA, TA")]
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
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchProjectTemplateDto>>>> SearchTemplates(string searchKey, [FromQuery] ProjectTemplateTypesEnum? type = null)
    {
        return ResultHelper(await _projectTemplateService.SearchProjectTemplatesAsync(searchKey, type));
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
    public async Task<ActionResult<ServiceResponse<string>>> GenerateTemplateUsingLLM([FromBody] GenereateProjectInstructionRequestDto genereateProjectInstructionRequestDto)
    {
        return ResultHelper(await _projectTemplateService.GenerateTemplateUsingLLMAsync(genereateProjectInstructionRequestDto));
    }

    // Validates whether the specified projects or resources are approved templates and checks their access permissions based on the provided access types.
    [HttpPost("validate-access")]
    public async Task<ActionResult<ServiceResponse<List<ProjectAccessStatusDto>>>> ValidateProjectAccess([FromBody] IEnumerable<ProjectAccessStatusDto> projectAccessStatusDtos)
    {
        return ResultHelper(await _projectTemplateService.ValidateProjectAccessAsync(projectAccessStatusDtos));
    }

    // Retrieves a list of project templates for select-option dropdowns,optionally filtered by template type.
    [HttpGet("select-option")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetProjectTemplatesForSelectOptions([FromQuery] ProjectTemplateTypesEnum? type = null)
    {
        return ResultHelper(await _projectTemplateService.GetProjectTemplatesForSelectOptionsAsync(type));
    }
}
