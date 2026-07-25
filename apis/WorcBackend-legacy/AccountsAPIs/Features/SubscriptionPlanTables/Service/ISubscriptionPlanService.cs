namespace AccountsAPIs.Services;

/// <summary>
/// Provides operations for managing subscription plans and related data.
/// </summary>
public interface ISubscriptionPlanService
{
    /// <summary>
    /// Retrieves all available subscription plans from the system.
    /// </summary>
    /// <param name="subscriptionPlanType">The type of the subscription plans to filter by (e.g., Basic, Pro, Starter).</param>
    /// <param name="frequency">The frequency of the subscription plans (e.g., monthly, yearly).</param>
    /// <param name="currency">The currency type of the subscription plans (e.g., USD, EUR).</param>
    /// <returns>
    /// A task representing the asynchronous operation. The task result contains a list of <see cref="SubscriptionPlanDto"/> objects.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SubscriptionPlanDto>>> GetAllSubscriptionPlansAsync(SubscriptionPlanTypeEnum subscriptionPlanType, SubscriptionFrequenciesEnum frequency, CurrencyTypesEnum currency);

    /// <summary>
    /// Retrieves all subscription plans available in the system.
    /// </summary>
    /// <returns>
    /// A task that represents the asynchronous operation. The result contains a <see cref="ServiceResponse{T}"/> 
    /// with a collection of <see cref="SubscriptionPlanDto"/> instances.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SubscriptionPlanDto>>> GetListSubscriptionPlansAsync();

    /// <summary>
    /// Retrieves a list of subscription plans formatted as selectable options, typically used in dropdowns or selection lists.
    /// </summary>
    /// <param name="subscriptionPlanType">An optional filter to return only subscription plans of a specific type.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a collection of <see cref="SelectOption"/> representing available subscription plans.
    /// </returns>
    Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableSubscriptionPlanOptionsAsync(SubscriptionPlanTypeEnum? subscriptionPlanType);

    /// <summary>
    /// Retrieves the details of a specific subscription plan by its unique identifier.
    /// </summary>
    /// <param name="subscriptionPlanId">The unique identifier of the subscription plan.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the <see cref="SubscriptionPlanDto"/> if found.
    /// </returns>
    Task<ServiceResponse<SubscriptionPlanDto>> GetSubscriptionPlanByIdAsync(Guid subscriptionPlanId);

    /// <summary>
    /// Creates a new subscription plan with the provided details.
    /// </summary>
    /// <param name="subscriptionPlanDto">The data required to create the new subscription plan.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the newly created <see cref="SubscriptionPlanDto"/>.
    /// </returns>
    Task<ServiceResponse<SubscriptionPlanDto>> CreateSubscriptionPlanAsync(SubscriptionPlanDto subscriptionPlanDto);

    /// <summary>
    /// Checks if a subscription plan name is available (not already taken).
    /// </summary>
    /// <param name="checkAvailabilityDto">DTO containing the subscription plan name to check.</param>
    /// <returns>A service response indicating whether the name is available.</returns>
    Task<ServiceResponse<TrueFalseResultDto>> IsSubscriptionPlanNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto);

    /// <summary>
    /// Updates the information of an existing subscription plan.
    /// </summary>
    /// <param name="subscriptionPlanDto">The updated subscription plan data.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the updated <see cref="SubscriptionPlanDto"/>.
    /// </returns>
    Task<ServiceResponse<SubscriptionPlanDto>> UpdateSubscriptionPlanAsync(SubscriptionPlanDto subscriptionPlanDto);

    /// <summary>
    /// Deletes a specific subscription plan by its unique identifier.
    /// </summary>
    /// <param name="subscriptionPlanId">The unique identifier of the subscription plan to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates whether the deletion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteSubscriptionPlanAsync(Guid subscriptionPlanId);

    /// <summary>
    /// Deletes multiple subscription plans identified by a list of unique identifiers.
    /// </summary>
    /// <param name="subscriptionPlanIds">A list of subscription plan IDs to delete.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates the success of the batch deletion.
    /// </returns>
    Task<ServiceResponse<bool>> DeleteSubscriptionPlansAsync(List<Guid> subscriptionPlanIds);
}
