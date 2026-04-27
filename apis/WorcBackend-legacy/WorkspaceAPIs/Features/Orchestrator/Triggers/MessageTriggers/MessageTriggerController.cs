namespace WorkspaceAPIs.Controllers;

[Route("message-trigger")]
[ApiController]
[Authorize]
public class MessageTriggerController : BaseApiController
{
    private readonly IMessageTriggerService _messageTriggerService;

    public MessageTriggerController(IMessageTriggerService messageTriggerService)
    {
        _messageTriggerService = messageTriggerService;
    }

    // Checks the availability of a message trigger name
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsMessageTriggerNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _messageTriggerService.IsMessageTriggerNameAvailableAsync(checkAvailabilityDto));
    }

    // Creates a new message trigger
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<MessageTriggerDto>>> CreateMessageTrigger([FromBody] MessageTriggerDto messageTriggerDto)
    {
        return ResultHelper(await _messageTriggerService.CreateMessageTriggerAsync(messageTriggerDto));
    }

    // Updates an existing message trigger
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<MessageTriggerDto>>> UpdateMessageTrigger([FromBody] MessageTriggerDto messageTriggerDto)
    {
        return ResultHelper(await _messageTriggerService.UpdateMessageTriggerAsync(messageTriggerDto));
    }

    // Retrieves a list of all message triggers
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MessageTriggerDto>>>> GetMessageTriggerList()
    {
        return ResultHelper(await _messageTriggerService.GetMessageTriggerListAsync());
    }

    // Retrieves message trigger details by ID
    [HttpGet("{messageTriggerId}")]
    public async Task<ActionResult<ServiceResponse<MessageTriggerDto>>> GetMessageTrigger(Guid messageTriggerId)
    {
        return ResultHelper(await _messageTriggerService.GetMessageTriggerAsync(messageTriggerId));
    }

    // Deletes a single message trigger by ID
    [HttpDelete("{messageTriggerId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMessageTrigger(Guid messageTriggerId)
    {
        return ResultHelper(await _messageTriggerService.DeleteMessageTriggerAsync(messageTriggerId));
    }

    // Deletes multiple message triggers
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMessageTriggers([FromBody] IEnumerable<Guid> messageTriggerIds)
    {
        return ResultHelper(await _messageTriggerService.DeleteMessageTriggersAsync(messageTriggerIds));
    }

    // Retrieves agents assigned to a specific message trigger
    [HttpGet("{messageTriggerId}/agents")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>>> GetAgentsByMessageTrigger(Guid messageTriggerId)
    {
        return ResultHelper(await _messageTriggerService.GetAgentsByMessageTriggerAsync(messageTriggerId));
    }

    // Receives an external notification and initiates job creation based on the provided trigger ID.
    [AllowAnonymous, GraphWebhookAuthorize]
    [HttpPost("notify/{triggerId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> CreateJobByMessageTriggerId(string triggerId, [FromBody] JsonElement payload)
    {
        return ResultHelper(await _messageTriggerService.CreateJobByMessageTriggerIdAsync(triggerId, payload));
    }
}