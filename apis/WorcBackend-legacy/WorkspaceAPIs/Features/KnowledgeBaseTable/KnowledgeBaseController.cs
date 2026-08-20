namespace WorkspaceAPIs.Controllers;

/// <summary>
/// Controller for managing Knowledge Base CRUD operations.
/// </summary>
[Route("knowledge-base")]
[ApiController]
[Authorize]
public class KnowledgeBaseController : BaseApiController
{
    private readonly IKnowledgeBaseService _knowledgeBaseService;

    public KnowledgeBaseController(IKnowledgeBaseService knowledgeBaseService)
    {
        _knowledgeBaseService = knowledgeBaseService;
    }

    // Retrieves all personal knowledge bases.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<KnowledgeBaseDto>>>> GetPersonalKnowledgeBases()
    {
        return ResultHelper(await _knowledgeBaseService.GetKnowledgeBasesAsync(true));
    }

    // Retrieves all shared knowledge bases.
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<KnowledgeBaseDto>>>> GetSharedKnowledgeBases()
    {
        return ResultHelper(await _knowledgeBaseService.GetKnowledgeBasesAsync(false));
    }

    // Retrieves knowledge bases in select-option format for dropdowns.
    [HttpGet("kb-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetSelectableKnowledgeBaseOptions()
    {
        return ResultHelper(await _knowledgeBaseService.GetSelectableKnowledgeBaseOptionsAsync());
    }

    // Checks the availability of a knowledge base name.
    [Authorize(Roles = "SA,TA,OM")]
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsKnowledgeBaseNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _knowledgeBaseService.IsKnowledgeBaseNameAvailableAsync(checkAvailabilityDto));
    }

    // Gets a knowledge base by name.
    [Authorize(Roles = "SA,TA,OM")]
    [HttpGet("by-name/{knowledgeBaseName}")]
    public async Task<ActionResult<ServiceResponse<KnowledgeBaseDto>>> GetKnowledgeBaseByName(string knowledgeBaseName)
    {
        return ResultHelper(await _knowledgeBaseService.GetKnowledgeBaseByNameAsync(knowledgeBaseName));
    }

    // Creates a new knowledge base.
    [Authorize(Roles = "SA,TA,OM")]
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<KnowledgeBaseDto>>> CreateKnowledgeBase([FromBody] KnowledgeBaseDto knowledgeBaseDto)
    {
        return ResultHelper(await _knowledgeBaseService.InsertKnowledgeBaseAsync(knowledgeBaseDto));
    }

    // Updates an existing knowledge base.
    [Authorize(Roles = "SA,TA,OM")]
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<KnowledgeBaseDto>>> UpdateKnowledgeBase([FromBody] KnowledgeBaseDto knowledgeBaseDto)
    {
        return ResultHelper(await _knowledgeBaseService.UpdateKnowledgeBaseAsync(knowledgeBaseDto));
    }

    // Deletes a knowledge base by its ID.
    [Authorize(Roles = "SA,TA,OM")]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteKnowledgeBase(Guid id)
    {
        return ResultHelper(await _knowledgeBaseService.DeleteKnowledgeBaseAsync(id));
    }

    // Deletes multiple knowledge bases.
    [Authorize(Roles = "SA,TA,OM")]
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleKnowledgeBases([FromBody] List<Guid> ids)
    {
        return ResultHelper(await _knowledgeBaseService.DeleteKnowledgeBasesAsync(ids));
    }
}
