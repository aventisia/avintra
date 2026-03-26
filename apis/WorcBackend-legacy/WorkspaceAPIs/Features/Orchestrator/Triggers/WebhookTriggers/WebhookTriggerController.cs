namespace WorkspaceAPIs.Controllers;

[Route("webhook-trigger")]
[ApiController]
[Authorize]
public class WebhookTriggerController : BaseApiController
{
    private readonly IWebhookTriggerService _webhookTriggerService;

    public WebhookTriggerController(IWebhookTriggerService webhookTriggerService)
    {
        _webhookTriggerService = webhookTriggerService;
    }

    // Checks availability of a webhook trigger name
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsWebhookTriggerNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _webhookTriggerService.IsWebhookTriggerNameAvailableAsync(checkAvailabilityDto));
    }

    // Creates a new webhook trigger
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<WebhookTriggerDto>>> CreateWebhookTrigger([FromBody] WebhookTriggerDto webhookTriggerDto)
    {
        return ResultHelper(await _webhookTriggerService.CreateWebhookTriggerAsync(webhookTriggerDto));
    }

    // Updates an existing webhook trigger
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<WebhookTriggerDto>>> UpdateWebhookTrigger([FromBody] WebhookTriggerDto webhookTriggerDto)
    {
        return ResultHelper(await _webhookTriggerService.UpdateWebhookTriggerAsync(webhookTriggerDto));
    }

    // Retrieves a list of all webhook triggers
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<WebhookTriggerDto>>>> GetWebhookTriggerList()
    {
        return ResultHelper(await _webhookTriggerService.GetWebhookTriggerListAsync());
    }

    // Retrieves a single webhook trigger by ID
    [HttpGet("{triggerId}")]
    public async Task<ActionResult<ServiceResponse<WebhookTriggerDto>>> GetWebhookTrigger(Guid triggerId)
    {
        return ResultHelper(await _webhookTriggerService.GetWebhookTriggerAsync(triggerId));
    }

    // Deletes a single webhook trigger
    [HttpDelete("{triggerId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteWebhookTrigger(Guid triggerId)
    {
        return ResultHelper(await _webhookTriggerService.DeleteWebhookTriggerAsync(triggerId));
    }

    // Deletes multiple webhook triggers
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteWebhookTriggers([FromBody] IEnumerable<Guid> triggerIds)
    {
        return ResultHelper(await _webhookTriggerService.DeleteWebhookTriggersAsync(triggerIds));
    }

    // Regenerates the API key for a webhook trigger (plain key returned once)
    [HttpPost("{triggerId}/regenerate-api-key")]
    public async Task<ActionResult<ServiceResponse<WebhookTriggerDto>>> RegenerateApiKey(Guid triggerId)
    {
        return ResultHelper(await _webhookTriggerService.RegenerateApiKeyAsync(triggerId));
    }

    // Retrieves the agent linked to a webhook trigger
    [HttpGet("{triggerId}/agents")]
    public async Task<ActionResult<ServiceResponse<AssignAgentTriggerDto>>> GetAgentByWebhookTrigger(Guid triggerId)
    {
        return ResultHelper(await _webhookTriggerService.GetAgentByWebhookTriggerAsync(triggerId));
    }
}
