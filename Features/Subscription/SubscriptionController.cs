namespace AccountsAPIs.Controllers;

[Route("subscription")]
[ApiController]
[Authorize]
public class SubscriptionController : BaseApiController
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    // Gets a list of subscriptions of single Plan using Plan Id and UserId
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SubscriptionDto>>>> GetSubscriptions(Guid planId, Guid userId)
    {
        return ResultHelper(await _subscriptionService.GetSubscriptionListAsync(planId, userId));
    }

    // Creates a new subscription
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<SubscriptionDto>>> InsertSubscription([FromBody] SubscriptionDto subscriptionDto)
    {
        return ResultHelper(await _subscriptionService.InsertSubscriptionAsync(subscriptionDto));
    }

    // Updates a subscription
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<SubscriptionDto>>> UpdateSubscription([FromBody] SubscriptionDto subscriptionDto)
    {
        return ResultHelper(await _subscriptionService.UpdateSubscriptionAsync(subscriptionDto));
    }

    // Deletes subscription permanently
    [HttpDelete("delete/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSubscription(Guid id)
    {
        return ResultHelper(await _subscriptionService.DeleteSubscriptionAsync(id));
    }
}