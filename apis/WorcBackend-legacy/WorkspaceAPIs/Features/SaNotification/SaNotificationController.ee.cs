namespace WorkspaceAPIs.Controllers;

[Route("sa/notification")]
[ApiController]
[Authorize(Roles = "SA")]
public class SaNotificationController : BaseApiController
{
    private readonly ISaNotificationService _saNotificationService;

    public SaNotificationController(ISaNotificationService saNotificationService)
    {
        _saNotificationService = saNotificationService;
    }

    // Retrieves a Super Admin notification by its ID.
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<SaNotificationDto>>> GetSaNotification(Guid id)
    {
        return ResultHelper(await _saNotificationService.GetSaNotificationAsync(id));
    }

    // Retrieves the list of Super Admin notifications.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SaNotificationDto>>>> GetSaNotifications()
    {
        return ResultHelper(await _saNotificationService.GetSaNotificationsAsync());
    }

    // Inserts a new Super Admin notification.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<SaNotificationDto>>> InsertSaNotification([FromBody] CreateSaNotificationDto createSaNotificationDto)
    {
        return ResultHelper(await _saNotificationService.InsertSaNotificationAsync(createSaNotificationDto));
    }

    // Updates an existing Super Admin notification. Only allowed while the notification has not been sent.
    [HttpPut("{id}")]
    public async Task<ActionResult<ServiceResponse<SaNotificationDto>>> UpdateSaNotification(Guid id, [FromBody] CreateSaNotificationDto createSaNotificationDto)
    {
        return ResultHelper(await _saNotificationService.UpdateSaNotificationAsync(createSaNotificationDto, id));
    }

    // Deletes a Super Admin notification by its ID. Only allowed while the notification has not been sent.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSaNotification(Guid id)
    {
        return ResultHelper(await _saNotificationService.DeleteSaNotificationAsync(id));
    }

    // Deletes multiple Super Admin notifications by their IDs. Only allowed while the notifications have not been sent.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<int>>> DeleteMultipleSaNotifications([FromBody] IEnumerable<Guid> ids)
    {
        return ResultHelper(await _saNotificationService.DeleteMultipleSaNotificationsAsync(ids));
    }

    // Retrieves the recipient users of a Super Admin notification (used to prefill the edit form).
    [HttpGet("{id}/recipients")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AppUserBaseDto>>>> GetSaNotificationRecipients(Guid id)
    {
        return ResultHelper(await _saNotificationService.GetSaNotificationRecipientsAsync(id));
    }

    // Searches users across all tenants for the Super Admin recipient picker.
    [HttpGet("users/search/{searchKey}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AppUserBaseDto>>>> SearchUsers(string searchKey)
    {
        return ResultHelper(await _saNotificationService.SearchUsersAsync(searchKey));
    }

    // Retrieves the list of active tenants for the Super Admin audience picker.
    [HttpGet("tenants")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SaTenantOptionDto>>>> GetTenants()
    {
        return ResultHelper(await _saNotificationService.GetTenantsAsync());
    }
}
