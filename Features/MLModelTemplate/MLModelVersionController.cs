namespace MLModelBuilderAPIs.Controllers;

[Route("ml-model-template")]
[ApiController]
[Authorize]
public class MLModelTemplateController : BaseApiController
{
    private readonly IMLModelTemplateService _mlModelTemplateService;

    public MLModelTemplateController(IMLModelTemplateService mlModelTemplateService)
    {
        _mlModelTemplateService = mlModelTemplateService;
    }

    // Get all templates of a specific ML model
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MLModelTemplateDto>>>> GetMLModelTemplatesByModelId(Guid? mlModelVersionId)
    {
        // Calling the service to get the list of templates for a specific ML model ID
        return ResultHelper(await _mlModelTemplateService.GetAllMLModelTemplatesAsync(mlModelVersionId));
    }

    // Get a specific template by its ID
    [HttpGet("{mlModelTemplateId}")]
    public async Task<ActionResult<ServiceResponse<MLModelTemplateDto>>> GetMLModelTemplateById(Guid mlModelTemplateId)
    {
        // Calling the service to get a template by its ID
        return ResultHelper(await _mlModelTemplateService.GetMLModelTemplateByIdAsync(mlModelTemplateId));
    }

    // Insert a new ML model template
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<MLModelTemplateDto>>> InsertMLModelTemplate([FromBody] MLModelTemplateDto mlModelTemplateDto)
    {
        // Calling the service to create a new template
        return ResultHelper(await _mlModelTemplateService.CreateMLModelTemplateAsync(mlModelTemplateDto));
    }

    // Update an existing ML model template
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<MLModelTemplateDto>>> UpdateMLModelTemplate([FromBody] MLModelTemplateDto mlModelTemplateDto)
    {
        // Calling the service to update an existing template
        return ResultHelper(await _mlModelTemplateService.UpdateMLModelTemplateAsync(mlModelTemplateDto));
    }

    // Delete a specific ML model template permanently
    [HttpDelete("{mlModelTemplateId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMLModelTemplate(Guid mlModelTemplateId)
    {
        // Calling the service to delete the template by its ID
        return ResultHelper(await _mlModelTemplateService.DeleteMLModelTemplateAsync(mlModelTemplateId));
    }

    // Bulk delete ML model templates
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleMLModelTemplates([FromBody] IEnumerable<Guid> mlModelTemplateIds)
    {
        // Calling the service to delete multiple templates
        return ResultHelper(await _mlModelTemplateService.DeleteMultipleMLModelTemplatesAsync(mlModelTemplateIds));
    }

    // Publish a specific ML model template
    [HttpPost("publish")]
    public async Task<ActionResult<ServiceResponse<bool>>> GetTrendingMLModelTemplate()
    {
        // Calling the service to publish the template
        return ResultHelper(await _mlModelTemplateService.GetTrendingMLModelTemplatesAsync());
    }
}
