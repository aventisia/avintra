namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("assist/conversations/messages")]
public class ConversationMessageController : BaseApiController
{
    private readonly IConversationMessageService _conversationMessageService;

    public ConversationMessageController(IConversationMessageService conversationMessageService)
    {
        _conversationMessageService = conversationMessageService;
    }

    // Sends a message (creates conversation if not exists).
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<ConversationMessageDto>>> SendMessage([FromBody] ConversationMessageRequestDto conversationMessageRequestDto)
    {
        return ResultHelper(await _conversationMessageService.SendMessageAsync(conversationMessageRequestDto));
    }

    // Gets all messages for a conversation (full history).
    [HttpGet("{conversationId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConversationMessageDto>>>> GetMessages(Guid conversationId)
    {
        return ResultHelper(await _conversationMessageService.GetMessagesAsync(conversationId));
    }

    // Gets recent messages for LLM context window.
    [HttpGet("{conversationId}/recent")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConversationMessageDto>>>> GetRecentMessages(Guid conversationId, [FromQuery] int count = 20)
    {
        return ResultHelper(await _conversationMessageService.GetRecentMessagesAsync(conversationId, count));
    }

    // Searches messages across all conversations.
    [HttpGet("search")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<ConversationMessageDto>>>> SearchMessages([FromQuery] string query)
    {
        return ResultHelper(await _conversationMessageService.SearchMessagesAsync(query));
    }
}