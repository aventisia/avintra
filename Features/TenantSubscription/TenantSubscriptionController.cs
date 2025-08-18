namespace AccountsAPIs.Controllers;

[Route("tenant-subscriptions")]
[ApiController]
[Authorize]
public class TenantSubscriptionController : BaseApiController
{
    private readonly ITenantSubscriptionService _tenantSubscriptionService;

    public TenantSubscriptionController(ITenantSubscriptionService tenantSubscriptionService)
    {
        _tenantSubscriptionService = tenantSubscriptionService;
    }

    // Retrieves all tenant subscriptions.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TenantSubscription>>>> GetAllTenantSubscriptions()
    {
        return ResultHelper(await _tenantSubscriptionService.GetAllTenantSubscriptionsAsync());
    }

    // Retrieves a specific tenant subscription by its unique identifier.
    [HttpGet("{tenantSubscriptionId}")]
    public async Task<ActionResult<ServiceResponse<TenantSubscription>>> GetTenantSubscriptionById(Guid tenantSubscriptionId)
    {
        return ResultHelper(await _tenantSubscriptionService.GetTenantSubscriptionByIdAsync(tenantSubscriptionId));
    }

    // Creates a new tenant subscription.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<TenantSubscription>>> CreateTenantSubscription([FromBody] TenantSubscriptionDto tenantSubscriptionDto)
    {
        return ResultHelper(await _tenantSubscriptionService.CreateTenantSubscriptionAsync(tenantSubscriptionDto));
    }

    // Updates an existing tenant subscription.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<TenantSubscription>>> UpdateTenantSubscription([FromBody] TenantSubscriptionDto tenantSubscriptionDto)
    {
        return ResultHelper(await _tenantSubscriptionService.UpdateTenantSubscriptionAsync(tenantSubscriptionDto));
    }

    // Deletes a specific tenant subscription by its unique identifier.
    [HttpDelete("{tenantSubscriptionId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTenantSubscription(Guid tenantSubscriptionId)
    {
        return ResultHelper(await _tenantSubscriptionService.DeleteTenantSubscriptionAsync(tenantSubscriptionId));
    }

    // Deletes multiple tenant subscriptions by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTenantSubscriptions([FromBody] List<Guid> tenantSubscriptionIds)
    {
        return ResultHelper(await _tenantSubscriptionService.DeleteTenantSubscriptionsAsync(tenantSubscriptionIds));
    }
}
