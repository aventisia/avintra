namespace WorkspaceAPIs.Controllers;

[Route("time-trigger")]
[ApiController]
[Authorize]
public class TimeTriggerController : BaseApiController
{
    private readonly ITimeTriggerService _timeTriggerService;
    public TimeTriggerController(ITimeTriggerService timeTriggerService)
    {
        _timeTriggerService = timeTriggerService;
    }

    // Checks the availability of a time trigger name.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsTriggerNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _timeTriggerService.IsTimeTriggerNameAvailableAsync(checkAvailabilityDto));
    }

    // Insert new time trigger
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<TimeTriggerDto>>> CreateNewTimeTrigger(TimeTriggerDto triggerDto)
    {
        return ResultHelper(await _timeTriggerService.CreateNewTimeTriggerAsync(triggerDto));
    }

    // Update an exiting time trigger
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<TimeTriggerDto>>> UpdateTimeTrigger(TimeTriggerDto triggerDto)
    {
        return ResultHelper(await _timeTriggerService.UpdateTimeTriggerAsync(triggerDto));
    }

    // Retrieves list of personal time triggers.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TimeTriggerDto>>>> GetPersonalTimeTriggerList()
    {
        return ResultHelper(await _timeTriggerService.GetTimeTriggerListAsync(true));
    }

    // Retrieves list of shared time triggers.
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TimeTriggerDto>>>> GetSharedTimeTriggerList()
    {
        return ResultHelper(await _timeTriggerService.GetTimeTriggerListAsync(false));
    }


    // Deletes a time trigger by its ID.
    [HttpGet("{timeTriggerId}")]
    public async Task<ActionResult<ServiceResponse<TimeTriggerDto>>> GetTimeTrigger(Guid timeTriggerId)
    {
        return ResultHelper(await _timeTriggerService.GetTimeTriggerAsync(timeTriggerId));
    }

    // Deletes a time trigger by its ID.
    [HttpDelete("{timeTriggerId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTimeTrigger(Guid timeTriggerId)
    {
        return ResultHelper(await _timeTriggerService.DeleteTimeTriggerAsync(timeTriggerId));
    }

    // Delete multiple time triggers by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTimeTriggers([FromBody] IEnumerable<Guid> timeTriggerIds)
    {
        return ResultHelper(await _timeTriggerService.DeleteTimeTriggersAsync(timeTriggerIds));
    }

    // Retrieve agent list by trigger ID.
    [HttpGet("{timeTriggerId}/agents")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>>> GetAgentsByTriggerAsync(Guid timeTriggerId)
    {
        return ResultHelper(await _timeTriggerService.GetAgentsByTriggerAsync(timeTriggerId));
    }

    // // Retrieve the select-option list of triggers
    // [HttpGet("select-option")]
    // public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetAgentToSelectOptionAsync()
    // {
    //     return ResultHelper(await triggerService.GetTriggerToSelectOptionAsync());
    // }
}