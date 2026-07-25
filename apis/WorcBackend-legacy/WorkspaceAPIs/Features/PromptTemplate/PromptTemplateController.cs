namespace WorkspaceAPIs.Controllers;

[Route("prompt-template")]
[ApiController]
[Authorize]
public class PromptTemplateController : BaseApiController
{
    private readonly IPromptTemplateService _promptTemplateService;

    public PromptTemplateController(IPromptTemplateService promptTemplateService)
    {
        _promptTemplateService = promptTemplateService;
    }

    // Checks the availability of a prompt template name.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsTemplateNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _promptTemplateService.IsPromptTemplateNameAvailableAsync(checkAvailabilityDto));
    }

    // Fetch all prompt templates
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<PromptTemplateTableDto>>>> GetAllPromptTemplates()
    {
        return ResultHelper(await _promptTemplateService.GetAllPromptTemplatesAsync());
    }

    // Fetch prompt template by its ID
    [HttpGet("{promptTemplateId}")]
    public async Task<ActionResult<ServiceResponse<PromptTemplateTableDto>>> GetPromptTemplate(Guid promptTemplateId)
    {
        return ResultHelper(await _promptTemplateService.GetPromptTemplateAsync(promptTemplateId));
    }

    // Fetch prompt template by its name
    [HttpGet("name/{promptTemplateName}")]
    public async Task<ActionResult<ServiceResponse<PromptTemplateTableDto>>> GetPromptTemplateByName(string promptTemplateName)
    {
        return ResultHelper(await _promptTemplateService.GetPromptTemplateByNameAsync(promptTemplateName));
    }

    // Create a new prompt template
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<PromptTemplateTableDto>>> InsertPromptTemplate([FromBody] PromptTemplateTableDto promptTemplateDto)
    {
        return ResultHelper(await _promptTemplateService.InsertPromptTemplateAsync(promptTemplateDto));
    }

    // Update an existing prompt template
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<PromptTemplateTableDto>>> UpdatePromptTemplate([FromBody] PromptTemplateTableDto promptTemplateDto)
    {
        return ResultHelper(await _promptTemplateService.UpdatePromptTemplateAsync(promptTemplateDto));
    }

    // Delete a prompt template by ID
    [HttpDelete("{promptTemplateId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeletePromptTemplate(Guid promptTemplateId)
    {
        return ResultHelper(await _promptTemplateService.DeletePromptTemplateAsync(promptTemplateId));
    }

    // Delete multiple prompt templates by IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultiplePromptTemplates([FromBody] IEnumerable<Guid> promptTemplateIds)
    {
        return ResultHelper(await _promptTemplateService.DeleteMultiplePromptTemplatesAsync(promptTemplateIds));
    }

    // Search prompt templates by name
    [HttpGet("search/{templateName}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<PromptTemplateTableDto>>>> GetAllPromptTemplates(string templateName)
    {
        return ResultHelper(await _promptTemplateService.SearchPromptTemplatesByNameAsync(templateName));
    }

    // Get select options
    [HttpGet("select-options")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetSelectOptions()
    {
        return ResultHelper(await _promptTemplateService.GetPromptTemplateOptionsAsync());
    }
}