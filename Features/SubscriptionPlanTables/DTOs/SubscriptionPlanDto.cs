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
    /// The display name of the subscription plan (e.g., Free, Pro, Enterprise).
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Number of usage credits allocated per month.
    /// </summary>
    public int MonthlyCredits { get; set; }

    /// <summary>
    /// Maximum number of agents or AI models that can be published under this plan.
    /// </summary>
    public int MaxPublishedItems { get; set; }

    /// <summary>
    /// Number of days for which workflow execution history is retained.
    /// </summary>
    public int HistoryRetentionDays { get; set; }

    /// <summary>
    /// Maximum number of spaces (e.g., workspaces or environments) allowed.
    /// </summary>
    public int MaxSpaces { get; set; }

    /// <summary>
    /// Maximum available storage capacity, in megabytes.
    /// </summary>
    public int StorageLimitMB { get; set; }

    /// <summary>
    /// Maximum number of users allowed under this subscription.
    /// </summary>
    public int MaxUsers { get; set; }

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