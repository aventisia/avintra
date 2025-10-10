namespace AccountsAPIs.Entities;

/// <summary>
/// Represents a tenant's subscription to a specific plan, including start and end dates.
/// </summary>
public class TenantSubscription : BaseEntity
{
    /// <summary>
    /// Gets or sets the ID of the tenant using the subscription.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the subscription frequency (e.g., monthly or yearly).
    /// </summary>
    public SubscriptionFrequenciesEnum Frequency { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether this is the current active subscription plan for the tenant.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of credits allocated.
    /// </summary>
    public ulong MaxCredits { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of agents or AI models that can be published under this subscription.
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
    /// Gets or sets the Razorpay subscription ID associated with this tenant's subscription.
    /// </summary>
    public string? RazorpaySubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the subscription plan assigned to the tenant.
    /// </summary>
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the subscription plan details.
    /// </summary>
    [ForeignKey("PlanId")]
    public virtual SubscriptionPlan? Plan { get; set; }
}