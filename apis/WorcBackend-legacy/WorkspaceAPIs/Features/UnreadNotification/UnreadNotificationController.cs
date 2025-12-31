namespace WorkspaceAPIs.Controllers;

[Route("notification/unread")]
[ApiController]
[Authorize]
public class UnreadNotificationController : BaseApiController
{
    private readonly IUnreadNotificationService _unreadNotificationService;

    public UnreadNotificationController(IUnreadNotificationService unreadNotificationService)
    {
        _unreadNotificationService = unreadNotificationService;
    }

    // Gets list of unread notifications for the user
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<UnreadNotificationDto>>>> GetUnreadNotifications()
    {
        return ResultHelper(await _unreadNotificationService.GetUnreadNotificationsAsync());
    }

    // Mark notification as read for the user
    [HttpPut("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> MarkNotificationAsRead(Guid id)
    {
        return ResultHelper(await _unreadNotificationService.MarkNotificationAsReadAsync(id));
    }
}