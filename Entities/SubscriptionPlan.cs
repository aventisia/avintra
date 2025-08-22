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
    /// Gets or sets the monthly price of the subscription plan.
    /// </summary>
    public required decimal MonthlyPrice { get; set; }

    /// <summary>
    /// Gets or sets the yearly price of the subscription plan.
    /// </summary>
    public required decimal YearlyPrice { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of credits allocated.
    /// </summary>
    public ulong MaxCredits { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of agents or AI models that can be published under this plan.
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
    /// Gets or sets the list of users associated with the space.
    /// </summary>
    public virtual ICollection<BillingDetail>? BillingDetails { get; set; }
}