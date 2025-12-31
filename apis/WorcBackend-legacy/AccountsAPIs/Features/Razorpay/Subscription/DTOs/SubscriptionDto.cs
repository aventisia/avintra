namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a request to create a new subscription, including plan, customer, schedule, and add-ons.
/// </summary>
public class SubscriptionRequestDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the subscription plan to apply.
    /// </summary>
    public required string PlanId { get; set; }

    /// <summary>
    /// Gets or sets the total number of billing cycles the subscription will run for.
    /// </summary>
    public int TotalCount { get; set; } = 1;

    /// <summary>
    /// Gets or sets the number of units of the selected plan to subscribe to.
    /// </summary>
    public int Quantity { get; set; } = 1;

    /// <summary>
    /// Gets or sets the unique identifier of the customer creating the subscription.
    /// </summary>
    public string? CustomerId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the customer should be notified upon subscription creation.
    /// </summary>
    public bool CustomerNotify { get; set; }

    /// <summary>
    /// Gets or sets the scheduled start date and time for the subscription. If null, it starts immediately.
    /// </summary>
    public DateTimeOffset? StartAt { get; set; }

    /// <summary>G
    /// ets or sets the optional expiration date and time when the subscription should end.
    /// </summary>
    public DateTimeOffset? ExpireBy { get; set; }

    /// <summary>
    /// Gets or sets the collection of optional add-on items included with the subscription.
    /// </summary>
    public List<AddOnItemDto>? Addons { get; set; }
}

/// <summary>
/// Represents an add-on item providing extra features or services within a subscription.
/// </summary>
public class AddOnItemDto
{
    /// <summary>
    /// Gets or sets the name of the add-on item, such as "Extra Storage" or "Premium Support".
    /// </summary>
    public required string ItemName { get; set; }

    /// <summary>
    /// Gets or sets the cost of the add-on item in the smallest currency unit (e.g., cents or paise).
    /// </summary>
    public int Amount { get; set; }

    /// <summary>
    /// Gets or sets the ISO 4217 currency code for the add-on amount (e.g., "USD", "INR").
    /// </summary>
    public CurrencyTypesEnum Currency { get; set; } = CurrencyTypesEnum.USD;
}

/// <summary>
/// Represents a request to update an existing subscription, including plan, offer, schedule, and other parameters.
/// </summary>
public class UpdateSubscriptionRequestDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the subscription plan to apply. 
    /// Can be null to keep the existing plan unchanged.
    /// </summary>
    public string? PlanId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the offer associated with the subscription. 
    /// Can be null to keep the existing offer unchanged.
    /// </summary>
    public string? OfferId { get; set; }

    /// <summary>
    /// Gets or sets the number of units of the selected plan to subscribe to. 
    /// Can be null to keep the existing quantity unchanged.
    /// </summary>
    public int? Quantity { get; set; }

    /// <summary>
    /// Gets or sets the remaining count of the subscription cycles. 
    /// Can be null to keep the existing remaining count unchanged.
    /// </summary>
    public int? RemainingCount { get; set; }

    /// <summary>
    /// Gets or sets the scheduled start date and time for the subscription update (in Unix timestamp). 
    /// If null, the subscription will keep the existing start date.
    /// </summary>
    public DateTimeOffset? StartAt { get; set; }

    /// <summary>
    /// Gets or sets the scheduled time for any planned changes to be applied. 
    /// Can be "now" for immediate changes or a specific Unix timestamp.
    /// </summary>
    public DateTimeOffset? ScheduleChangeAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the customer should be notified upon subscription update.
    /// </summary>
    public bool? CustomerNotify { get; set; }
}


/// <summary>
/// Represents the details of an existing subscription, including its status, start and end times, billing cycles, and payment method.
/// </summary>
public class SubscriptionResponseDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the subscription.
    /// </summary>
    public required string Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the associated subscription plan.
    /// </summary>
    public required string PlanId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the customer.
    /// </summary>
    public string? CustomerId { get; set; }

    /// <summary>
    /// Gets or sets the current status of the subscription (e.g., active, cancelled).
    /// </summary>
    public string? Status { get; set; }

    /// <summary>
    /// Gets or sets the start time of the current billing cycle.
    /// </summary>
    public DateTimeOffset? CurrentStart { get; set; }

    /// <summary>
    /// Gets or sets the end time of the current billing cycle.
    /// </summary>
    public DateTimeOffset? CurrentEnd { get; set; }

    /// <summary>
    /// Gets or sets the time when the subscription ended, if applicable.
    /// </summary>
    public DateTimeOffset? EndedAt { get; set; }

    /// <summary>
    /// Gets or sets the quantity of the subscribed plan.
    /// </summary>
    public int Quantity { get; set; }

    /// <summary>
    /// Gets or sets custom key-value notes attached to the subscription.
    /// </summary>
    public Dictionary<string, string>? Notes { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the next charge is scheduled.
    /// </summary>
    public DateTimeOffset? ChargeAt { get; set; }

    /// <summary>
    /// Gets or sets the start date and time of the subscription.
    /// </summary>
    public DateTimeOffset? StartAt { get; set; }

    /// <summary>
    /// Gets or sets the end date and time of the subscription.
    /// </summary>
    public DateTimeOffset? EndAt { get; set; }

    /// <summary>
    /// Gets or sets the total number of billing cycles for the subscription.
    /// </summary>
    public int TotalCount { get; set; }

    /// <summary>
    /// Gets or sets the number of billing cycles that have been paid for.
    /// </summary>
    public int PaidCount { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the customer was notified about the subscription.
    /// </summary>
    public bool CustomerNotify { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the subscription was created.
    /// </summary>
    public DateTimeOffset CreatedAt { get; set; }

    /// <summary>
    /// Gets or sets the expiration date and time of the subscription.
    /// </summary>
    public DateTimeOffset? ExpireBy { get; set; }

    /// <summary>
    /// Gets or sets the shortened URL for the subscription (e.g., invoice or management link).
    /// </summary>
    public string ShortUrl { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether any scheduled changes exist for the subscription.
    /// </summary>
    public bool HasScheduledChanges { get; set; }

    /// <summary>
    /// Gets or sets the date and time when a scheduled change will take effect.
    /// </summary>
    public DateTimeOffset? ChangeScheduledAt { get; set; }

    /// <summary>
    /// Gets or sets the payment method used for the subscription, if available.
    /// </summary>
    public string? PaymentMethod { get; set; }

    /// <summary>
    /// Gets or sets the number of billing cycles remaining in the subscription.
    /// </summary>
    public int RemainingCount { get; set; }
}

/// <summary>
/// Specifies when the action (pause or resume) should be applied to the subscription.
/// </summary>
public enum SubscriptionActionTimingEnum
{
    /// <summary>
    /// Apply the action immediately, effective right now.
    /// </summary>
    Now,

    /// <summary>
    /// Apply the action at the end of the current subscription cycle.
    /// </summary>
    CycleEnd
}
