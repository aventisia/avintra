[Route("webhook")]
[ApiController]
public class TriggerWebhookController : BaseApiController
{
    private readonly ITriggerWebhookService _triggerWebhookService;

    public TriggerWebhookController(ITriggerWebhookService triggerWebhookService)
    {
        _triggerWebhookService = triggerWebhookService;
    }

    // Receives a webhook request and creates a job based on the provided trigger ID.
    [AllowAnonymous]
    [HttpPost("trigger/{triggerId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> ProcessWebhookAsync(string triggerId)
    {
        return ResultHelper(await _triggerWebhookService.CreateJobByTriggerIdAsync(triggerId));
    }
}