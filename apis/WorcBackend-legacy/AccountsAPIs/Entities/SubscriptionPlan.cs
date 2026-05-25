namespace AccountsAPIs.Entities;

/// <summary>
/// Defines the configuration of a subscription plan, including usage limits and feature entitlements 
/// such as monthly credits, published items, storage, spaces, user access, and workflow history retention.
/// </summary>
public class SubscriptionPlan : BaseEntity
{
    /// <summary>
    /// Gets or sets the display name of the subscription plan (e.g., Free, Pro, Enterprise).
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the subscription plan (e.g., Starter, Pro, Enterprise, Commercial).
    /// </summary>
    public required SubscriptionPlanTypeEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the billing frequency for the subscription plan (e.g., monthly or yearly).
    /// </summary>
    public SubscriptionFrequenciesEnum Frequency { get; set; }

    /// <summary>
    /// Gets or sets the currency used for the subscription plan pricing, with a default value of USD.
    /// </summary>
    public required CurrencyTypesEnum Currency { get; set; }

    /// <summary>
    /// Gets or sets a unique name for the subscription plan, combining its Name, Frequency, and Currency.
    /// </summary>
    public string UniqueName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the price of the subscription plan.
    /// </summary>
    public required decimal Price { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of credits allocated.
    /// </summary>
    public ulong MaxCredits { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of agents that can be published under this plan.
    /// </summary>
    public int MaxPublishedItems { get; set; }

    /// <summary>
    /// Gets or sets the duration (in days) for which workflow execution history is retained.
    /// </summary>
    public int HistoryRetentionDays { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of spaces (e.g., workspaces) that can be created.
    /// </summary>
    public int MaxSpaces { get; set; }

    /// <summary>
    /// Gets or sets the maximum storage capacity available under this plan, in megabytes.
    /// </summary>
    public int StorageLimitMB { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of users permitted for this subscription.
    /// </summary>
    public int MaxUsers { get; set; }

    /// <summary>
    /// Gets or sets the current status of the subscription plan.
    /// </summary>
    public PlanStatusTypesEnum Status { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this plan is the default plan in the system.
    /// </summary>
    public bool IsDefault { get; set; } = false;

    /// <summary>
    /// Gets or sets a value indicating whether tax needs to be included for this subscription plan.
    /// </summary>
    public bool IncludeTax { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay plan ID associated with this subscription plan.
    /// </summary>
    public string? RazorpayPlanId { get; set; }
    
    /// <summary>
    /// Gets or sets the collection of tenants associated with the plan.
    /// </summary>
    public virtual ICollection<TenantSubscription>? TenantSubscriptions { get; set; }
}