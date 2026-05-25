namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the main view model for a customer's billing or subscription dashboard.
/// </summary>
public class SubscriptionDashboardDto
{
    /// <summary>
    /// Gets or sets the details of the current tenant subscription plan.
    /// </summary>
    public CurrentSubscriptionPlanDto? CurrentPlan { get; set; }

    /// <summary>
    /// Gets or sets the details for the upcoming payment.
    /// </summary>
    public NextPaymentDetailDto? NextPayment { get; set; }
}

/// <summary>
/// Describes a subscription plan, its features, and current resource usage.
/// </summary>
public class CurrentSubscriptionPlanDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the subscription associated with this billing.
    /// </summary>
    public Guid SubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the id of the plan.
    /// </summary>
    public Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the public name of the plan (e.g., "Starter", "Pro").
    /// </summary>
    public string? PlanName { get; set; }

    /// <summary>
    /// Gets or sets the type of the subscription plan (e.g., Starter, Pro, Enterprise, Commercial).
    /// </summary>
    public required SubscriptionPlanTypeEnum PlanType { get; set; }

    /// <summary>
    /// Gets or sets the billing frequency (e.g., "Billed Monthly").
    /// </summary>
    public SubscriptionFrequenciesEnum Frequency { get; set; }

    /// <summary>
    /// Gets or sets the base price of the current plan.
    /// </summary>
    public decimal Price { get; set; }

    /// <summary>
    /// Gets or sets the ISO currency code (e.g., "USD").
    /// </summary>
    public CurrencyTypesEnum Currency { get; set; }

    /// <summary>
    /// Gets or sets whether the plan is currently active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets whether the plan has recurring payments.
    /// </summary>
    public bool IsRecurringPayment { get; set; }

    /// <summary>
    /// Gets or sets the Razorpay subscription ID associated with this tenant's subscription.
    /// </summary>
    public string? RazorpaySubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the date when the plan expired. Null if the plan is ongoing.
    /// </summary>
    public DateTimeOffset? ExpiredOn { get; set; }

    /// <summary>
    /// Gets or sets the number of available credits.
    /// </summary>
    public double AvailableCredits { get; set; }

    /// <summary>
    /// Gets or sets a feature included in the current plan.
    /// </summary>
    public CurrentSubscriptionPlanDetailDto Feature { get; set; } = new CurrentSubscriptionPlanDetailDto();

    /// <summary>
    /// Gets or sets a list detailing the usage of various resources.
    /// </summary>
    public List<ResourceUsageDto> Usage { get; set; } = new List<ResourceUsageDto>();
}

/// <summary>
/// Represents the consumption of a specific, limited resource.
/// </summary>
public class ResourceUsageDto
{
    /// <summary>
    /// Gets or sets the name of the resource (e.g., "Storage", "Spaces").
    /// </summary>
    public string ResourceName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the amount of the resource that has been used.
    /// </summary>
    public double Used { get; set; }

    /// <summary>
    /// Gets or sets the total amount of the resource included in the plan.
    /// </summary>
    public int Limit { get; set; }

    /// <summary>
    /// Gets or sets the unit of measurement for the resource (e.g., "mb").
    /// </summary>
    public string? Unit { get; set; }
}

/// <summary>
/// Contains information about the next scheduled payment.
/// </summary>
public class NextPaymentDetailDto
{
    /// <summary>
    /// Gets or sets the date the next payment is due.
    /// </summary>
    public DateTimeOffset? DueDate { get; set; }

    /// <summary>
    /// Gets or sets the base cost of the subscription.
    /// </summary>
    public decimal SubscriptionFee { get; set; }

    /// <summary>
    /// Gets or sets the amount charged for taxes.
    /// </summary>
    public decimal Tax { get; set; }

    /// <summary>
    /// Gets or sets the final total amount to be paid.
    /// </summary>
    public decimal TotalAmount { get; set; }
}

/// <summary>
/// Data transfer object representing the details of a current subscription plan detail, 
/// including limits on users, storage, credits, and other configurable features.
/// </summary>
public class CurrentSubscriptionPlanDetailDto
{
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
}