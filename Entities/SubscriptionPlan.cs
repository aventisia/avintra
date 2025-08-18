namespace AccountsAPIs.Entities;

/// <summary>
/// Defines the configuration of a subscription plan, including usage limits and feature entitlements 
/// such as monthly credits, published items, storage, spaces, user access, and workflow history retention.
/// </summary>
public class SubscriptionPlan : BaseEntity
{
    /// <summary>
    /// The display name of the subscription plan (e.g., Free, Pro, Enterprise).
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// The number of usage credits allocated per month.
    /// </summary>
    public int MonthlyCredits { get; set; }

    /// <summary>
    /// The maximum number of agents or AI models that can be published under this plan.
    /// </summary>
    public int MaxPublishedItems { get; set; }

    /// <summary>
    /// The duration (in days) for which workflow execution history is retained.
    /// </summary>
    public int HistoryRetentionDays { get; set; }

    /// <summary>
    /// The maximum number of spaces (e.g., workspaces or environments) that can be created.
    /// </summary>
    public int MaxSpaces { get; set; }

    /// <summary>
    /// The maximum storage capacity available under this plan, in megabytes.
    /// </summary>
    public int StorageLimitMB { get; set; }

    /// <summary>
    /// The maximum number of users permitted for this subscription.
    /// </summary>
    public int MaxUsers { get; set; }
}
