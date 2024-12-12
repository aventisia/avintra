namespace  WorkspaceAPIs.Services;

public interface ISubscriptionService
{
    /// <summary>
    /// Get subscription list of a user
    /// </summary>
    /// <param name="planId">Plan Id</param>
    /// <param name="userId">User Id</param>
    /// <returns>A list of active subscriptions of a user</returns>
    Task<ServiceResponse<IEnumerable<SubscriptionDto>>> GetSubscriptionListAsync(Guid planId, Guid userId);

    /// <summary>
    /// Inserts a subscription
    /// </summary>
    /// <param name="subscriptionDto">Subscription DTO</param>
    /// <returns>A newly created subscription</returns>
    Task<ServiceResponse<SubscriptionDto>> InsertSubscriptionAsync(SubscriptionDto subscriptionDto);

    /// <summary>
    /// Updates a subscription
    /// </summary>
    /// <param name="subscriptionDto">Subscription DTO</param>
    /// <returns>An updated subscription</returns>
    Task<ServiceResponse<SubscriptionDto>> UpdateSubscriptionAsync(SubscriptionDto subscriptionDto);

    /// <summary>
    /// Deletes a subscription
    /// </summary>
    /// <param name="id">Id</param>
    /// <returns>True, if delete job is successful, else false</returns>
    Task<ServiceResponse<bool>> DeleteSubscriptionAsync(Guid id);
}