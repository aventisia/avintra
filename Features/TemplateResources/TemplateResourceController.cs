namespace WorkspaceAPIs.Controllers;

[Route("template-resources")]
[ApiController]
[Authorize]
public class TemplateResourceController : BaseApiController
{
    private readonly ITemplateResourceService _templateResourceService;

    public TemplateResourceController(ITemplateResourceService templateResourceService)
    {
        _templateResourceService = templateResourceService;
    }

    // Retrieves a list of template resources for a given project template ID
    [HttpGet("list/{projectTemplateId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TemplateResourceDto>>>> GetTemplateResources(Guid projectTemplateId)
    {
        return ResultHelper(await _templateResourceService.GetTemplateResourcesByProjectTemplateIdAsync(projectTemplateId));
    }

    // Retrieves a specific template resource by its unique identifier.
    [HttpGet("{templateResourceId}")]
    public async Task<ActionResult<ServiceResponse<TemplateResourceDto>>> GetTemplateResourceById(Guid templateResourceId)
    {
        return ResultHelper(await _templateResourceService.GetTemplateResourceByIdAsync(templateResourceId));
    }

    // Adds a new template resource
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<TemplateResourceDto>>> InsertTemplateResource([FromBody] TemplateResourceDto resourceDto)
    {
        return ResultHelper(await _templateResourceService.InsertTemplateResourceAsync(resourceDto));
    }

    // Updates an existing template resource
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<TemplateResourceDto>>> UpdateTemplateResource([FromBody] TemplateResourceDto resourceDto)
    {
        return ResultHelper(await _templateResourceService.UpdateTemplateResourceAsync(resourceDto));
    }

    // Deletes a template resource by its unique identifier
    [HttpDelete("{templateResourceId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTemplateResource(Guid templateResourceId)
    {
        return ResultHelper(await _templateResourceService.DeleteTemplateResourceAsync(templateResourceId));
    }

    // Deletes multiple template resources by their unique identifiers
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleTemplateResources([FromBody] IEnumerable<Guid> templateResourceIds)
    {
        return ResultHelper(await _templateResourceService.DeleteMultipleTemplateResourcesAsync(templateResourceIds));
    }
}
