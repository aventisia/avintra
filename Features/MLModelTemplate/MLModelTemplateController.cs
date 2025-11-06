namespace MLModelBuilderAPIs.Controllers;

[Route("ai-model-template")]
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
    public async Task<ActionResult<ServiceResponse<IEnumerable<MLModelTemplateDto>>>> GetMLModelTemplatesByModelId()
    {
        // Calling the service to get the list of templates for a specific ML model ID
        return ResultHelper(await _mlModelTemplateService.GetAllMLModelTemplatesAsync());
    }

    // Get a specific template by its ID
    [HttpGet("{mlModelTemplateId}")]
    public async Task<ActionResult<ServiceResponse<MLModelTemplateDto>>> GetMLModelTemplateById(Guid mlModelTemplateId)
    {
        // Calling the service to get a template by its ID
        return ResultHelper(await _mlModelTemplateService.GetMLModelTemplateByIdAsync(mlModelTemplateId));
    }

    // Publish a ML model template
    [HttpPost("publish")]
    public async Task<ActionResult<ServiceResponse<MLModelTemplateDto>>> PublishMLModelTemplate([FromBody] PublishMLModelTemplateDto publishMLModelTemplateDto)
    {
        // Calling the service to create a new template
        return ResultHelper(await _mlModelTemplateService.PublishMLModelTemplateAsync(publishMLModelTemplateDto));
    }

    // Retrieve the template schema of a specific ML model version
    [HttpGet("schema/{projectVersionId}")]
    public async Task<ActionResult<ServiceResponse<MLModelTemplateDto>>> GetAIModelTemplateSchema(Guid projectVersionId)
    {
        return ResultHelper(await _mlModelTemplateService.GetAIModelTemplateSchemaAsync(projectVersionId));
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
    [HttpGet("trending")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TrendingTemplateDto>>>> GetTrendingMLModelTemplate()
    {
        // Calling the service to publish the template
        return ResultHelper(await _mlModelTemplateService.GetTrendingMLModelTemplatesAsync());
    }

    // Creates a new ml model using the selected trending template.
    [HttpPost("use")]
    public async Task<ActionResult<ServiceResponse<bool>>> UseTemplateToCreateMLModel([FromBody] AIModelTemplateSchemaDto aiModelTemplateSchemaDto)
    {
        return ResultHelper(await _mlModelTemplateService.UseTemplateToCreateMLModelAsync(aiModelTemplateSchemaDto));
    }
}
