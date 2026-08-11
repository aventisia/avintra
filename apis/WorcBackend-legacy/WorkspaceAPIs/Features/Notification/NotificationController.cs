namespace WorkspaceAPIs.Controllers;

[Route("notification")]
[ApiController]
[Authorize]
public class NotificationController : BaseApiController
{
    private readonly INotificationService _notificationService;
    private readonly INotificationHistoryService _notificationHistoryService;

    public NotificationController(
        INotificationService notificationService,
        INotificationHistoryService notificationHistoryService)
    {
        _notificationService = notificationService;
        _notificationHistoryService = notificationHistoryService;
    }

    // Retrieves a notification by its ID.
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<NotificationDto>>> GetNotification(Guid id)
    {
        return ResultHelper(await _notificationService.GetNotificationAsync(id));
    }

    // Retrieves list of notifications.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<NotificationDto>>>> GetNotifications()
    {
        return ResultHelper(await _notificationService.GetNotificationsAsync());
    }

    // Inserts a new notification.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<NotificationDto>>> InsertNotification([FromBody] CreateNotificationDto createNotificationDto)
    {
        return ResultHelper(await _notificationService.InsertNotificationAsync(createNotificationDto));
    }

    // Updates an existing notification. Only allowed while the notification has not been sent.
    [HttpPut("{id}")]
    public async Task<ActionResult<ServiceResponse<NotificationDto>>> UpdateNotification(Guid id, [FromBody] CreateNotificationDto createNotificationDto)
    {
        return ResultHelper(await _notificationService.UpdateNotificationAsync(createNotificationDto, id));
    }

    // Deletes a notification by its ID. Only allowed while the notification has not been sent.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteNotification(Guid id)
    {
        return ResultHelper(await _notificationService.DeleteNotificationAsync(id));
    }

    // Deletes multiple notifications by their IDs. Only allowed while the notifications have not been sent.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<int>>> DeleteMultipleNotifications([FromBody] IEnumerable<Guid> ids)
    {
        return ResultHelper(await _notificationService.DeleteMultipleNotificationsAsync(ids));
    }

    // Retrieves the recipient users of a notification (used to prefill the edit form).
    [HttpGet("{id}/recipients")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AppUserBaseDto>>>> GetNotificationRecipients(Guid id)
    {
        return ResultHelper(await _notificationService.GetNotificationRecipientsAsync(id));
    }

    // Retrieves a list of notification history rows for the current user, with optional filters.
    [HttpGet("history")]
    public async Task<ActionResult<ServiceResponse<NotificationHistoryListDto>>> GetHistory(
        NotificationTypesEnum? type = null,
        NotificationSourceEnum? sourceType = null,
        bool? isRead = null,
        DateTimeOffset? from = null,
        DateTimeOffset? to = null)
    {
        return ResultHelper(await _notificationHistoryService.GetHistoryAsync(type, sourceType, isRead, from, to));
    }
}
