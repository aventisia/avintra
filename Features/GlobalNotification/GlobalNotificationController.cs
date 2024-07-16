namespace WorkspaceAPIs.Controllers;

[Route("notification/global")]
[ApiController]
[Authorize(Roles = "SA,GA,GSA")]
public class GlobalNotificationController : BaseApiController
{
    private readonly IGlobalNotificationService _globalNotificationCrudService;

    public GlobalNotificationController(IGlobalNotificationService globalNotificationCrudService)
    {
        _globalNotificationCrudService = globalNotificationCrudService;
    }

    // Retrieves a global notification by its ID.
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<GlobalNotificationDto>>> GetGlobalNotification(Guid id)
    {
        return ResultHelper(await _globalNotificationCrudService.GetGlobalNotificationAsync(id));
    }

    // Retrieves list of global notifications.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<GlobalNotificationDto>>>> GetGlobalNotifications()
    {
        return ResultHelper(await _globalNotificationCrudService.GetGlobalNotificationsAsync());
    }

    // Inserts a new global notification.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<GlobalNotificationDto>>> InsertGlobalNotification([FromBody] GlobalNotificationDto globalNotificationDto)
    {
        return ResultHelper(await _globalNotificationCrudService.InsertGlobalNotificationAsync(globalNotificationDto));
    }

    // Updates an existing global notification. This operation is only allowed within 10 minutes of creation.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<GlobalNotificationDto>>> UpdateGlobalNotification([FromBody] GlobalNotificationDto globalNotificationDto)
    {
        return ResultHelper(await _globalNotificationCrudService.UpdateGlobalNotificationAsync(globalNotificationDto));
    }

    // Deletes a global notification by its ID. This operation is only allowed within 10 minutes of creation.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteGlobalNotification(Guid id)
    {
        return ResultHelper(await _globalNotificationCrudService.DeleteGlobalNotificationAsync(id));
    }
}