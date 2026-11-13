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

    /// <summary>
    /// Retrieves a page of the current user's titled landing conversations, most recent first, optionally filtered by title; archived ones when asked.
    /// </summary>
    [HttpGet("landing/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<LandingConversationDto>>>> GetLandingConversations(
        [FromQuery] string? search, [FromQuery] bool archived = false, [FromQuery] Guid? projectId = null, [FromQuery] int skip = 0, [FromQuery] int take = 30)
    {
        return ResultHelper(await _conversationService.GetLandingConversationsAsync(search, archived, projectId, skip, take));
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

    /// <summary>
    /// Renames one of the current user's landing conversations.
    /// </summary>
    [HttpPut("landing/title")]
    public async Task<ActionResult<ServiceResponse<bool>>> UpdateLandingConversationTitle([FromBody] UpdateConversationTitleDto updateConversationTitleDto)
    {
        return ResultHelper(await _conversationService.UpdateLandingConversationTitleAsync(updateConversationTitleDto));
    }

    /// <summary>
    /// Files one of the current user's landing conversations under a project, or ungroups it.
    /// </summary>
    [HttpPut("landing/project")]
    public async Task<ActionResult<ServiceResponse<bool>>> UpdateLandingConversationProject([FromBody] UpdateConversationProjectDto updateConversationProjectDto)
    {
        return ResultHelper(await _conversationService.UpdateLandingConversationProjectAsync(updateConversationProjectDto));
    }

    /// <summary>
    /// Pins or unpins one of the current user's landing conversations.
    /// </summary>
    [HttpPut("landing/pin")]
    public async Task<ActionResult<ServiceResponse<bool>>> UpdateLandingConversationPin([FromBody] UpdateConversationPinDto updateConversationPinDto)
    {
        return ResultHelper(await _conversationService.UpdateLandingConversationPinAsync(updateConversationPinDto));
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

    /// <summary>
    /// Shares one of the current user's conversations by issuing a read-only token (idempotent).
    /// </summary>
    [HttpPost("{conversationId}/share")]
    public async Task<ActionResult<ServiceResponse<string>>> Share(Guid conversationId)
    {
        return ResultHelper(await _conversationService.ShareAsync(conversationId));
    }

    /// <summary>
    /// Stops sharing one of the current user's conversations by clearing its read-only token.
    /// </summary>
    [HttpPost("{conversationId}/unshare")]
    public async Task<ActionResult<ServiceResponse<bool>>> Unshare(Guid conversationId)
    {
        return ResultHelper(await _conversationService.UnshareAsync(conversationId));
    }

    /// <summary>
    /// Retrieves a shared conversation by its read-only token.
    /// </summary>
    [HttpGet("shared/{shareToken}")]
    public async Task<ActionResult<ServiceResponse<ConversationDto>>> GetShared(string shareToken)
    {
        return ResultHelper(await _conversationService.GetSharedAsync(shareToken));
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