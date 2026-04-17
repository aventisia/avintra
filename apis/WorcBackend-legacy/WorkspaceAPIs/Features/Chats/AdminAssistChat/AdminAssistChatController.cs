namespace WorkspaceAPIs.Controllers;

[Route("admin/conversations")]
[ApiController]
[Authorize]
public class AdminConversationController : BaseApiController
{
    private readonly IAdminConversationService _adminConversationService;

    public AdminConversationController(IAdminConversationService adminConversationService)
    {
        _adminConversationService = adminConversationService;
    }

    // Retrieves a filtered list of conversations for administrative monitoring and analysis.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AdminConversationDto>>>> GetConversationsAsync([FromQuery] ConversationFilterDto conversationFilterDto)
    {
        return ResultHelper(await _adminConversationService.GetAdminConversationsAsync(conversationFilterDto));
    }

    // Retrieves a specific conversation along with its full message history.
    [HttpGet("{conversationId}/messages")]
    public async Task<ActionResult<ServiceResponse<AdminConversationMessageDto>>> GetConversationMessagesAsync(Guid conversationId)
    {
        return ResultHelper(await _adminConversationService.GetMessagesByConversationIdAsync(conversationId));
    }
}