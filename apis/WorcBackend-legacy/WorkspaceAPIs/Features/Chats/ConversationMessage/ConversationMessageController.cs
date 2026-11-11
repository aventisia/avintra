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
    public async Task<ActionResult<ServiceResponse<ConversationMessageDto>>> SendMessage([FromBody] ConversationMessageDto conversationMessageDto)
    {
        return ResultHelper(await _conversationMessageService.SendMessageAsync(conversationMessageDto));
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

    // Rates the reply to one user turn.
    [HttpPut("{conversationId}/feedback")]
    public async Task<ActionResult<ServiceResponse<bool>>> SetFeedback(Guid conversationId, [FromBody] MessageFeedbackDto feedback)
    {
        return ResultHelper(await _conversationMessageService.SetFeedbackAsync(conversationId, feedback));
    }

    // Searches messages across all conversations.
    [HttpGet("search")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SearchConversationMessageDto>>>> SearchMessages([FromQuery] string query)
    {
        return ResultHelper(await _conversationMessageService.SearchMessagesAsync(query));
    }
}