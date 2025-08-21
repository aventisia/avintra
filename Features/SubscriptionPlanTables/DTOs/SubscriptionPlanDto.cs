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
    /// Gets or sets the monthly price of the subscription plan.
    /// </summary>
    [Range(1, 99999)]
    public required int MonthlyPrice { get; set; }

    /// <summary>
    /// Gets or sets the yearly price of the subscription plan.
    /// </summary>
    [Range(1, 99999)]
    public required int YearlyPrice { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of credits allocated.
    /// </summary>
    public ulong MaxCredits { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of agents or AI models that can be published under this plan.
    /// </summary>
    [Range(-1, 99999)]
    public int MaxPublishedItems { get; set; }

    /// <summary>
    /// Gets or sets the duration (in days) for which workflow execution history is retained.
    /// </summary>
    [Range(-1, 99999)]
    public int HistoryRetentionDays { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of spaces (e.g., workspaces) that can be created.
    /// </summary>
    [Range(-1, 99999)]
    public int MaxSpaces { get; set; }

    /// <summary>
    /// Gets or sets the maximum storage capacity available under this plan, in megabytes.
    /// </summary>
    [Range(-1, 99999)]
    public int StorageLimitMB { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of users permitted for this subscription.
    /// </summary>
    [Range(-1, 99999)]
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