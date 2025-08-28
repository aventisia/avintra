namespace AccountsAPIs.Controllers;

[Route("subscription-plans")]
[ApiController]
[Authorize]
public class SubscriptionPlanController : BaseApiController
{
    private readonly ISubscriptionPlanService _subscriptionPlanService;

    public SubscriptionPlanController(ISubscriptionPlanService subscriptionPlanService)
    {
        _subscriptionPlanService = subscriptionPlanService;
    }

    // Retrieves all subscription plans.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SubscriptionPlanDto>>>> GetAllSubscriptionPlans(SubscriptionPlanTypeEnum? type)
    {
        return ResultHelper(await _subscriptionPlanService.GetAllSubscriptionPlansAsync(type));
    }

    // Gets a list of subscription plans for selection options.
    [HttpGet("option-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOptionDto>>>> GetSelectableSubscriptionPlanOptions(SubscriptionPlanTypeEnum? type)
    {
        return ResultHelper(await _subscriptionPlanService.GetSelectableSubscriptionPlanOptionsAsync(type));
    }

    // Retrieves a specific subscription plan by its unique identifier.
    [HttpGet("{subscriptionPlanId}")]
    public async Task<ActionResult<ServiceResponse<SubscriptionPlanDto>>> GetSubscriptionPlanById(Guid subscriptionPlanId)
    {
        return ResultHelper(await _subscriptionPlanService.GetSubscriptionPlanByIdAsync(subscriptionPlanId));
    }

    // Creates a new subscription plan.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<SubscriptionPlanDto>>> CreateSubscriptionPlan([FromBody] SubscriptionPlanDto subscriptionPlanDto)
    {
        return ResultHelper(await _subscriptionPlanService.CreateSubscriptionPlanAsync(subscriptionPlanDto));
    }

    // Checks the availability of a subscription plan.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsSubscriptionPlanNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _subscriptionPlanService.IsSubscriptionPlanNameAvailableAsync(checkAvailabilityDto));
    }

    // Updates an existing subscription plan.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<SubscriptionPlanDto>>> UpdateSubscriptionPlan([FromBody] SubscriptionPlanDto subscriptionPlanDto)
    {
        return ResultHelper(await _subscriptionPlanService.UpdateSubscriptionPlanAsync(subscriptionPlanDto));
    }

    // Deletes a specific subscription plan by its unique identifier.
    [HttpDelete("{subscriptionPlanId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSubscriptionPlan(Guid subscriptionPlanId)
    {
        return ResultHelper(await _subscriptionPlanService.DeleteSubscriptionPlanAsync(subscriptionPlanId));
    }

    // Deletes multiple subscription plans by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSubscriptionPlans([FromBody] List<Guid> subscriptionPlanIds)
    {
        return ResultHelper(await _subscriptionPlanService.DeleteSubscriptionPlansAsync(subscriptionPlanIds));
    }
}
