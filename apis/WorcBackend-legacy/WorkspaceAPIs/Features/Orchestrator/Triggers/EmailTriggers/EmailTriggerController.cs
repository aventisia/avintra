namespace WorkspaceAPIs.Controllers;

[Route("email-trigger")]
[ApiController]
[Authorize]
public class EmailTriggerController : BaseApiController
{
    private readonly IEmailTriggerService _emailTriggerService;

    public EmailTriggerController(IEmailTriggerService emailTriggerService)
    {
        _emailTriggerService = emailTriggerService;
    }

    // Checks the availability of an email trigger name
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsEmailTriggerNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _emailTriggerService.IsEmailTriggerNameAvailableAsync(checkAvailabilityDto));
    }

    // Creates a new email trigger
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<EmailTriggerDto>>> CreateEmailTrigger([FromBody] EmailTriggerDto emailTriggerDto)
    {
        return ResultHelper(await _emailTriggerService.CreateEmailTriggerAsync(emailTriggerDto));
    }

    // Updates an existing email trigger
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<EmailTriggerDto>>> UpdateEmailTrigger([FromBody] EmailTriggerDto emailTriggerDto)
    {
        return ResultHelper(await _emailTriggerService.UpdateEmailTriggerAsync(emailTriggerDto));
    }

    // Retrieves a list of personal email triggers
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<EmailTriggerDto>>>> GetPersonalEmailTriggerList()
    {
        return ResultHelper(await _emailTriggerService.GetEmailTriggerListAsync(true));
    }


    // Retrieves a list of shared email triggers
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<EmailTriggerDto>>>> GetSharedEmailTriggerList()
    {
        return ResultHelper(await _emailTriggerService.GetEmailTriggerListAsync(false));
    }

    // Retrieves email trigger details by ID
    [HttpGet("{emailTriggerId}")]
    public async Task<ActionResult<ServiceResponse<EmailTriggerDto>>> GetEmailTrigger(Guid emailTriggerId)
    {
        return ResultHelper(await _emailTriggerService.GetEmailTriggerAsync(emailTriggerId));
    }

    // Deletes a single email trigger by ID
    [HttpDelete("{emailTriggerId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteEmailTrigger(Guid emailTriggerId)
    {
        return ResultHelper(await _emailTriggerService.DeleteEmailTriggerAsync(emailTriggerId));
    }

    // Deletes multiple email triggers
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteEmailTriggers([FromBody] IEnumerable<Guid> emailTriggerIds)
    {
        return ResultHelper(await _emailTriggerService.DeleteEmailTriggersAsync(emailTriggerIds));
    }

    // Retrieves agents assigned to a specific email trigger
    [HttpGet("{emailTriggerId}/agents")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>>> GetAgentsByEmailTrigger(Guid emailTriggerId)
    {
        return ResultHelper(await _emailTriggerService.GetAgentsByEmailTriggerAsync(emailTriggerId));
    }


    // Receives an external notification and initiates job creation based on the provided trigger ID.
    [AllowAnonymous, GraphWebhookAuthorize]
    [HttpPost("notify/{triggerId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> CreateJobByEmailTriggerId(string triggerId, [FromBody] JsonElement payload)
    {
        return ResultHelper(await _emailTriggerService.CreateJobByEmailTriggerIdAsync(triggerId, payload));
    }
}