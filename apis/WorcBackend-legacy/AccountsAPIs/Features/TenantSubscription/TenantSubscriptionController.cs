namespace AccountsAPIs.Controllers;

[Route("tenant-subscriptions")]
[ApiController]
[Authorize(Roles = "TA")]
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

    // Update a tenant's subscription using the provided subscription details.
    [HttpPut("frequency")]
    public async Task<ActionResult<ServiceResponse<TenantSubscriptionDto>>> UpdateSubscription(SubscriptionUpdateRequestDto subscriptionUpdateRequestDto)
    {
        return ResultHelper(await _tenantSubscriptionService.UpdateSubscriptionAsync(subscriptionUpdateRequestDto));
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

    // Purchase of a tenant subscription based on the provided details.
    [HttpPost("purchase-plan")]
    public async Task<ActionResult<ServiceResponse<TenantSubscriptionDto>>> PurchaseTenantSubscriptions([FromBody] TenantSubscriptionPurchaseDto tenantSubscriptionPurchaseDto)
    {
        return ResultHelper(await _tenantSubscriptionService.PurchaseTenantSubscriptionPlanAsync(tenantSubscriptionPurchaseDto));
    }

    // Retrieve current subscription plan details.
    [HttpGet("current-plan")]
    public async Task<ActionResult<ServiceResponse<SubscriptionDashboardDto>>> CurrentTenantSubscriptions()
    {
        return ResultHelper(await _tenantSubscriptionService.GetCurrentTenantSubscriptionPlanAsync());
    }

    // Upgrades a tenant's subscription plan based on the provided details.
    [HttpPut("upgrade-plan")]
    public async Task<ActionResult<ServiceResponse<TenantSubscriptionDto>>> UpgradeSubscription([FromBody] TenantSubscriptionPurchaseDto tenantSubscriptionPurchaseDto)
    {
        return ResultHelper(await _tenantSubscriptionService.UpgradeSubscriptionPlanAsync(tenantSubscriptionPurchaseDto));
    }

    // Upgrades a self hosted tenant's subscription plan based on the provided details.
    [HttpPost("self-hosted/upgrade")]
    public async Task<ActionResult<ServiceResponse<TenantSubscriptionDto>>> UpgradeSelfHostedSubscriptionPlan([FromBody] SelfHostedSubscriptionUpgradeDto selfHostedSubscriptionUpgradeDto)
    {
        return ResultHelper(await _tenantSubscriptionService.UpgradeSelfHostedSubscriptionPlanAsync(selfHostedSubscriptionUpgradeDto));
    }

    // Cancels a tenant's subscription using the provided subscription details.
    [HttpPut("cancel-subscription")]
    public async Task<ActionResult<ServiceResponse<TenantSubscriptionDto>>> CancelSubscription(SubscriptionUpdateRequestDto subscriptionUpdateRequestDto)
    {
        return ResultHelper(await _tenantSubscriptionService.CancelSubscriptionAsync(subscriptionUpdateRequestDto));
    }

    // Cancels a tenant's recurring payment using the provided subscription details.
    [HttpPut("cancel-recurring-payment")]
    public async Task<ActionResult<ServiceResponse<TenantSubscriptionDto>>> CancelRecurringPayment(SubscriptionUpdateRequestDto subscriptionUpdateRequestDto)
    {
        return ResultHelper(await _tenantSubscriptionService.CancelRecurringPaymentAsync(subscriptionUpdateRequestDto));
    }

    // Retrieves all active tenant subscriptions along with their retention history details.
    [AllowAnonymous]
    [HttpGet("retention")]
    public async Task<ActionResult<ServiceResponse<TenantSubscriptionInfoDto>>> GetAllSubscriptions()
    {
        return ResultHelper(await _tenantSubscriptionService.GetAllSubscriptionsAsync());
    }
}
