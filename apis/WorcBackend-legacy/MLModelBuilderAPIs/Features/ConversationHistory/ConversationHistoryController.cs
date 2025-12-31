namespace MLModelBuilderAPIs.Controllers;

[Route("conversation-history")]
[ApiController]
[Authorize]
public class ConversationHistoryController : BaseApiController
{
    private readonly IConversationHistoryService _conversationHistoryService;

    public ConversationHistoryController(IConversationHistoryService conversationHistoryService)
    {
        _conversationHistoryService = conversationHistoryService;
    }

    // Gets list of conversation histories for a specific ML model using its mlModelId, optionally filtered by conversationId.
    [HttpGet("list/{mlModelId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConversationHistoryDto>>>> GetConversationHistories(Guid mlModelId, Guid? cid)
    {
        return ResultHelper(await _conversationHistoryService.GetConversationHistoriesByMLModelIdAsync(mlModelId, cid));
    }

    // Retrieves a specific conversation history entry by its unique identifier.
    [HttpGet("{conversationHistoryId}")]
    public async Task<ActionResult<ServiceResponse<ConversationHistoryDto>>> GetConversationHistoryById(Guid conversationHistoryId)
    {
        return ResultHelper(await _conversationHistoryService.GetConversationHistoryByIdAsync(conversationHistoryId));
    }

    // Adds a new conversation history entry for a specific ML model.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ConversationHistoryDto>>> InsertConversationHistory([FromBody] ConversationHistoryDto conversationHistoryDto)
    {
        return ResultHelper(await _conversationHistoryService.InsertConversationHistoryAsync(conversationHistoryDto));
    }

    // Updates an existing conversation history entry.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<ConversationHistoryDto>>> UpdateConversationHistory([FromBody] ConversationHistoryDto conversationHistoryDto)
    {
        return ResultHelper(await _conversationHistoryService.UpdateConversationHistoryAsync(conversationHistoryDto));
    }

    // Deletes a conversation history entry from the ML model permanently.
    [HttpDelete("{conversationHistoryId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteConversationHistory(Guid conversationHistoryId)
    {
        return ResultHelper(await _conversationHistoryService.DeleteConversationHistoryAsync(conversationHistoryId));
    }

    // Deletes multiple conversation history entries by a list of their unique identifiers.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleConversationHistories([FromBody] IEnumerable<Guid> conversationHistoryIds)
    {
        return ResultHelper(await _conversationHistoryService.DeleteMultipleConversationHistoriesAsync(conversationHistoryIds));
    }
}