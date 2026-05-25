namespace AccountsAPIs.DTOs;

/// <summary>
/// Data transfer object representing the details of a subscription plan, 
/// including limits on users, storage, credits, and other configurable features.
/// </summary>
public class SubscriptionPlanDto
{
    /// <summary>
    /// Unique identifier of the subscription plan.
    /// </summary>
    public Guid Id { get; set; }

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
    /// Gets or sets the current status of the subscription plan. The default value is Current.
    /// </summary>
    public PlanStatusTypesEnum Status { get; set; } = PlanStatusTypesEnum.Current;

    /// <summary>
    /// Gets or sets a value indicating whether this plan is the default plan in the system.
    /// </summary>
    public bool IsDefault { get; set; }

    /// <summary>
    /// Indicates whether the plan is disabled.
    /// Nullable to support enabled, disabled, or undefined states.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Username of the user who created the subscription plan.
    /// Used for response purposes only.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Timestamp indicating when the plan was created.
    /// Used for response purposes only.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Username of the user who last modified the subscription plan.
    /// Used for response purposes only.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Timestamp indicating when the plan was last modified.
    /// Used for response purposes only.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}