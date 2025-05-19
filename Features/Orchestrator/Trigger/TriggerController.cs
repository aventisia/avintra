namespace WorkspaceAPIs.Controllers;

[Route("trigger"), ApiController, Authorize]
public class TriggerController(ITriggerService triggerService) : BaseApiController
{

    // Checks the availability of a trigger name.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsTriggerNameAvailableAsync([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await triggerService.IsTriggerNameAvailableAsync(checkAvailabilityDto));
    }

    // Insert new trigger
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<TriggerDto>>> CreateNewTrigger(TriggerDto triggerDto)
    {
        return ResultHelper(await triggerService.CreateNewTriggerAsync(triggerDto));
    }

    // Update an exiting trigger
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<TriggerDto>>> UpdateTrigger(TriggerDto triggerDto)
    {
        return ResultHelper(await triggerService.UpdateTriggerAsync(triggerDto));
    }

    // Retrieves list of triggers.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TriggerDto>>>> GetTriggerList()
    {
        return ResultHelper(await triggerService.GetTriggerListAsync());
    }

    // Deletes a trigger by its ID.
    [HttpGet("{triggerId}")]
    public async Task<ActionResult<ServiceResponse<TriggerDto>>> GetTrigger(Guid triggerId)
    {
        return ResultHelper(await triggerService.GetTriggerAsync(triggerId));
    }

    // Deletes a trigger by its ID.
    [HttpDelete("{triggerId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTrigger(Guid triggerId)
    {
        return ResultHelper(await triggerService.DeleteTriggerAsync(triggerId));
    }

    // Delete multiple triggers by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTriggersAsync([FromBody] IEnumerable<Guid> triggerIds)
    {
        return ResultHelper(await triggerService.DeleteTriggersAsync(triggerIds));
    }

    // Retrieve agent list by trigger ID.
    [HttpGet("{triggerId}/agents")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>>> GetAgentsByTriggerAsync(Guid triggerId)
    {
        return ResultHelper(await triggerService.GetAgentsByTriggerAsync(triggerId));
    }

    // Retrieve the select-option list of triggers
    [HttpGet("select-option")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOptionDto>>>> GetAgentToSelectOptionAsync()
    {
        return ResultHelper(await triggerService.GetTriggerToSelectOptionAsync());
    }
}