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
    [HttpGet("all")]
    public async Task<IActionResult> GetAllSubscriptionPlans(SubscriptionPlanTypeEnum type = SubscriptionPlanTypeEnum.Pro, SubscriptionFrequenciesEnum frequency = SubscriptionFrequenciesEnum.Monthly, CurrencyTypesEnum currency = CurrencyTypesEnum.USD)
    {
        return ResultHelper(await _subscriptionPlanService.GetAllSubscriptionPlansAsync(type, frequency, currency));
    }

    // Retrieves list subscription plans.
    [HttpGet("list")]
    public async Task<IActionResult> GetAllSubscriptionPlans()
    {
        return ResultHelper(await _subscriptionPlanService.GetListSubscriptionPlansAsync());
    }

    // Gets a list of subscription plans for selection options.
    [HttpGet("option-to-select")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOption>>>> GetSelectableSubscriptionPlanOptions(SubscriptionPlanTypeEnum? type)
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
    [Authorize(Roles = "SA")]
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<SubscriptionPlanDto>>> CreateSubscriptionPlan([FromBody] SubscriptionPlanDto subscriptionPlanDto)
    {
        return ResultHelper(await _subscriptionPlanService.CreateSubscriptionPlanAsync(subscriptionPlanDto));
    }

    // Checks the availability of a subscription plan.
    [Authorize(Roles = "SA")]
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsSubscriptionPlanNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _subscriptionPlanService.IsSubscriptionPlanNameAvailableAsync(checkAvailabilityDto));
    }

    // Updates an existing subscription plan.
    [Authorize(Roles = "SA")]
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<SubscriptionPlanDto>>> UpdateSubscriptionPlan([FromBody] SubscriptionPlanDto subscriptionPlanDto)
    {
        return ResultHelper(await _subscriptionPlanService.UpdateSubscriptionPlanAsync(subscriptionPlanDto));
    }

    // Deletes a specific subscription plan by its unique identifier.
    [Authorize(Roles = "SA")]
    [HttpDelete("{subscriptionPlanId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSubscriptionPlan(Guid subscriptionPlanId)
    {
        return ResultHelper(await _subscriptionPlanService.DeleteSubscriptionPlanAsync(subscriptionPlanId));
    }

    // Deletes multiple subscription plans by their IDs.
    [Authorize(Roles = "SA")]
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSubscriptionPlans([FromBody] List<Guid> subscriptionPlanIds)
    {
        return ResultHelper(await _subscriptionPlanService.DeleteSubscriptionPlansAsync(subscriptionPlanIds));
    }
}
