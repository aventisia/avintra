namespace AccountsAPIs.Services;

public interface ISubscriptionService
{
    /// <summary>
    /// Creates a new subscription based on the provided details.
    /// This includes specifying the subscription plan, customer information, billing cycles, and any optional add-ons.
    /// </summary>
    /// <param name="subscriptionRequestDto">The request object containing details for the new subscription.</param>
    /// <returns>A task representing the asynchronous operation, with a result containing the created subscription's details.</returns>
    Task<ServiceResponse<SubscriptionResponseDto>> CreateSubscriptionAsync(SubscriptionRequestDto subscriptionRequestDto);

    /// <summary>
    /// Retrieves a subscription using its unique identifier.
    /// This will return the full details of the subscription, including its current status, payment information, and subscription period.
    /// </summary>
    /// <param name="subscriptionId">The unique identifier of the subscription to retrieve.</param>
    /// <returns>A task representing the asynchronous operation, with a result containing the subscription's details.</returns>
    Task<ServiceResponse<SubscriptionResponseDto>> GetSubscriptionByIdAsync(string subscriptionId);

    /// <summary>
    /// Updates an existing subscription with the specified information.
    /// You can modify details such as the subscription plan, billing cycles, quantity, or add-ons. 
    /// If a value is not provided, the subscription will retain its existing settings.
    /// </summary>
    /// <param name="subscriptionId">The unique identifier of the subscription to update.</param>
    /// <param name="updateSubscriptionRequestDto">The request object containing the new details for the subscription.</param>
    /// <returns>A task representing the asynchronous operation, with a result containing the updated subscription's details.</returns>
    Task<ServiceResponse<SubscriptionResponseDto>> UpdateSubscriptionAsync(string subscriptionId, UpdateSubscriptionRequestDto updateSubscriptionRequestDto);

    /// <summary>
    /// Retrieves all subscriptions, with support for pagination to handle large result sets.
    /// This method can be used to fetch a list of active or inactive subscriptions for a given account or system.
    /// </summary>
    /// <returns>A task representing the asynchronous operation, with a result containing a list of all subscriptions.</returns>
    Task<ServiceResponse<List<SubscriptionResponseDto>>> GetAllSubscriptionsAsync();

    /// <summary>
    /// Cancels an active subscription. You can choose to cancel the subscription immediately or at the end of the current billing cycle.
    /// Once canceled, the subscription will no longer be renewed, and the customer will not be billed for future cycles.
    /// </summary>
    /// <param name="subscriptionId">The unique identifier of the subscription to cancel.</param>
    /// <param name="subscriptionAction">Specifies whether to cancel the subscription immediately or at the end of the current billing cycle.</param>
    /// <returns>A task representing the asynchronous operation, with a result containing the canceled subscription's details.</returns>
    Task<ServiceResponse<SubscriptionResponseDto>> CancelSubscriptionAsync(string subscriptionId, SubscriptionActionTimingEnum subscriptionAction);

    /// <summary>
    /// Pauses an active subscription. You can choose to pause the subscription immediately or at the end of the current billing cycle.
    /// The subscription will temporarily stop, and the customer will not be billed during the pause period. 
    /// The subscription can be resumed at a later time.
    /// </summary>
    /// <param name="subscriptionId">The unique identifier of the subscription to pause.</param>
    /// <param name="subscriptionAction">Specifies when to pause the subscription—either immediately or at the end of the billing cycle.</param>
    /// <returns>A task representing the asynchronous operation, with a result containing the paused subscription's details.</returns>
    Task<ServiceResponse<SubscriptionResponseDto>> PauseSubscriptionAsync(string subscriptionId, SubscriptionActionTimingEnum subscriptionAction);

    /// <summary>
    /// Resumes a previously paused subscription. 
    /// You can choose to resume the subscription immediately or at the end of the current billing cycle. 
    /// Once resumed, the subscription will resume its normal billing and service cycle.
    /// </summary>
    /// <param name="subscriptionId">The unique identifier of the subscription to resume.</param>
    /// <param name="subscriptionAction">Specifies when to resume the subscription—either immediately or at the end of the billing cycle.</param>
    /// <returns>A task representing the asynchronous operation, with a result containing the resumed subscription's details.</returns>
    Task<ServiceResponse<SubscriptionResponseDto>> ResumeSubscriptionAsync(string subscriptionId, SubscriptionActionTimingEnum subscriptionAction);
}