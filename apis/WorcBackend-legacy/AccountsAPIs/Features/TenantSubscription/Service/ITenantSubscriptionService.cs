namespace AccountsAPIs.Services;

/// <summary>
/// Provides operations for managing tenant subscriptions and related data.
/// </summary>
public interface ITenantSubscriptionService
{
    /// <summary>
    /// Retrieves all tenant subscriptions in the system.
    /// </summary>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of all <see cref="TenantSubscriptionDto"/>.
    /// </returns>
    Task<ServiceResponse<IEnumerable<TenantSubscriptionDto>>> GetAllTenantSubscriptionsAsync();

    /// <summary>
    /// Retrieves the details of a specific tenant subscription by its unique identifier.
    /// </summary>
    /// <param name="tenantSubscriptionId">The unique identifier of the tenant subscription.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="TenantSubscriptionDto"/> if found.
    /// </returns>
    Task<ServiceResponse<TenantSubscriptionDto>> GetTenantSubscriptionByIdAsync(Guid tenantSubscriptionId);

    /// <summary>
    /// Creates a new tenant subscription with the provided details.
    /// </summary>
    /// <param name="tenantSubscriptionDto">The data required to create the new tenant subscription.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the newly created <see cref="TenantSubscriptionDto"/>.
    /// </returns>
    Task<ServiceResponse<TenantSubscriptionDto>> CreateTenantSubscriptionAsync(TenantSubscriptionDto tenantSubscriptionDto);

    /// <summary>
    /// Updates the information of an existing tenant subscription.
    /// </summary>
    /// <param name="tenantSubscriptionDto">The updated tenant subscription data.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the updated <see cref="TenantSubscriptionDto"/>.
    /// </returns>
    Task<ServiceResponse<TenantSubscriptionDto>> UpdateTenantSubscriptionAsync(TenantSubscriptionDto tenantSubscriptionDto);

    /// <summary>
    /// Deletes a specific tenant subscription by its unique identifier.
    /// </summary>
    /// <param name="tenantSubscriptionId">The unique identifier of the tenant subscription to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates whether the deletion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteTenantSubscriptionAsync(Guid tenantSubscriptionId);

    /// <summary>
    /// Deletes multiple tenant subscriptions identified by a list of unique identifiers.
    /// </summary>
    /// <param name="tenantSubscriptionIds">A list of tenant subscription IDs to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates the success of the batch deletion.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteTenantSubscriptionsAsync(List<Guid> tenantSubscriptionIds);

    /// <summary>
    /// Purchases a subscription plan for a tenant.
    /// </summary>
    /// <param name="tenantSubscriptionPurchaseDto">Details of the subscription purchase.</param>
    /// <returns>A task with the purchased subscription details.</returns>
    Task<ServiceResponse<TenantSubscriptionDto>> PurchaseTenantSubscriptionPlanAsync(TenantSubscriptionPurchaseDto tenantSubscriptionPurchaseDto);

    /// <summary>
    /// Retrieves the current subscription plan for a tenant.
    /// </summary>
    /// <returns>A task with the tenant's current subscription details.</returns>
    Task<ServiceResponse<SubscriptionDashboardDto>> GetCurrentTenantSubscriptionPlanAsync();

    /// <summary>
    /// Upgrades the subscription plan for a tenant.
    /// </summary>
    /// <param name="tenantSubscriptionPurchaseDto">The details of the subscription upgrade request.</param>
    /// <returns>A task that represents the asynchronous operation, containing the updated subscription details.</returns>
    Task<ServiceResponse<TenantSubscriptionDto>> UpgradeSubscriptionPlanAsync(TenantSubscriptionPurchaseDto tenantSubscriptionPurchaseDto);

    /// <summary>
    /// Upgrades the subscription plan for a self-hosted tenant.
    /// </summary>
    /// <param name="selfHostedSubscriptionUpgradeDto">Contains the details of the subscription upgrade request, including the subscription and plan information.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the updated subscription details for the tenant.</returns>
    Task<ServiceResponse<TenantSubscriptionDto>> UpgradeSelfHostedSubscriptionPlanAsync(SelfHostedSubscriptionUpgradeDto selfHostedSubscriptionUpgradeDto);

    /// <summary>
    /// Cancels the tenant's subscription using the provided subscription details.
    /// </summary>
    /// <param name="subscriptionUpdateRequestDto">The subscription details, including the subscription ID, status, and other relevant information.</param>
    /// <returns>A task representing the asynchronous operation, containing the result of the subscription cancellation.</returns>
    Task<ServiceResponse<TenantSubscriptionDto>> CancelSubscriptionAsync(SubscriptionUpdateRequestDto subscriptionUpdateRequestDto);

    /// <summary>
    /// Updates the tenant's subscription using the provided subscription details.
    /// </summary>
    /// <param name="subscriptionUpdateRequestDto">The subscription details, including the subscription ID, status, and other relevant information.</param>
    /// <returns>A task representing the asynchronous operation, containing the result of the subscription cancellation.</returns>
    Task<ServiceResponse<TenantSubscriptionDto>> UpdateSubscriptionAsync(SubscriptionUpdateRequestDto subscriptionUpdateRequestDto);

    /// <summary>
    /// Cancels the tenant's recurring payment based on the provided subscription details.
    /// </summary>
    /// <param name="subscriptionUpdateRequestDto">The subscription details, including the subscription ID, status, and other relevant information.</param>
    /// <returns>A task representing the asynchronous operation, containing the result of the recurring payment cancellation.</returns>
    Task<ServiceResponse<TenantSubscriptionDto>> CancelRecurringPaymentAsync(SubscriptionUpdateRequestDto subscriptionUpdateRequestDto);

    /// <summary>
    /// Retrieves all tenant subscriptions, including retention period details.
    /// </summary>
    /// <returns>A task representing the asynchronous operation, containing a list of all tenant subscriptions with retention period.</returns>
    Task<ServiceResponse<List<TenantSubscriptionInfoDto>>> GetAllSubscriptionsAsync();
}