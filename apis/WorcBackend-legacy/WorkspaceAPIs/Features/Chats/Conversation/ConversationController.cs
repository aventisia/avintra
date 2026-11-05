namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("assist/conversations")]
public class ConversationController : BaseApiController
{
    private readonly IConversationService _conversationService;

    public ConversationController(IConversationService conversationService)
    {
        _conversationService = conversationService;
    }

    // Gets active conversations for a specific flow version.
    [HttpGet("{flowVersionId}/active")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConversationDto>>>> GetActiveConversations(Guid flowVersionId)
    {
        return ResultHelper(await _conversationService.GetActiveConversationsAsync(flowVersionId));
    }

    // Gets archived conversations for a specific flow version.
    [HttpGet("{flowVersionId}/archived")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConversationDto>>>> GetArchivedConversations(Guid flowVersionId)
    {
        return ResultHelper(await _conversationService.GetArchivedConversationsAsync(flowVersionId));
    }

    /// <summary>
    /// Retrieves active agent-less landing conversations for the current user.
    /// </summary>
    [HttpGet("landing/active")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConversationDto>>>> GetLandingActiveConversations()
    {
        return ResultHelper(await _conversationService.GetLandingActiveConversationsAsync());
    }

    /// <summary>
    /// Retrieves archived agent-less landing conversations for the current user.
    /// </summary>
    [HttpGet("landing/archived")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConversationDto>>>> GetLandingArchivedConversations()
    {
        return ResultHelper(await _conversationService.GetLandingArchivedConversationsAsync());
    }

    // Gets a conversation by its ID.
    [HttpGet("{conversationId}")]
    public async Task<ActionResult<ServiceResponse<ConversationDto>>> GetById(Guid conversationId)
    {
        return ResultHelper(await _conversationService.GetByIdAsync(conversationId));
    }

    // Creates a new conversation.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ConversationDto>>> Create([FromBody] ConversationDto conversationDto)
    {
        return ResultHelper(await _conversationService.CreateAsync(conversationDto));
    }

    // Updates an existing conversation (e.g., title or metadata).
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ConversationDto>>> Update([FromBody] ConversationDto conversationDto)
    {
        return ResultHelper(await _conversationService.UpdateAsync(conversationDto));
    }

    // Archives a conversation (moves it to archived state).
    [HttpPost("{conversationId}/archive")]
    public async Task<ActionResult<ServiceResponse<bool>>> Archive(Guid conversationId)
    {
        return ResultHelper(await _conversationService.ArchiveAsync(conversationId));
    }

    // Unarchives a conversation (moves it back to active state).
    [HttpPost("{conversationId}/unarchive")]
    public async Task<ActionResult<ServiceResponse<bool>>> Unarchive(Guid conversationId)
    {
        return ResultHelper(await _conversationService.UnarchiveAsync(conversationId));
    }

    //Archives multiple conversations.
    [HttpPost("bulk/archive")]
    public async Task<ActionResult<ServiceResponse<bool>>> BulkArchive([FromBody] IEnumerable<Guid> conversationIds)
    {
        return ResultHelper(await _conversationService.ArchiveBulkAsync(conversationIds));
    }

    // Deletes a conversation (use only if deletion is allowed).
    [HttpDelete("{conversationId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> Delete(Guid conversationId)
    {
        return ResultHelper(await _conversationService.DeleteAsync(conversationId));
    }
}