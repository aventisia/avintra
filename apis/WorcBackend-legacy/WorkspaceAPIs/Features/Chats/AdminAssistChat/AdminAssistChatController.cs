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

    // Retrieves conversations for administrative monitoring based on the provided filters.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AdminConversationDto>>>> GetConversationsAsync(
        [FromQuery] ConversationFilterDto conversationFilterDto)
    {
        return ResultHelper(await _adminConversationService.GetAdminConversationsAsync(conversationFilterDto));
    }

    // Retrieves conversations for administrative monitoring based on the provided filters.
    [HttpGet("{conversationId}/messages")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AdminConversationDto>>>> GetConversationsAsync(Guid conversationId)
    {
        return ResultHelper(await _adminConversationService.GetMessagesByConversationIdAsync(conversationId));
    }
}