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
    /// Gets or sets the date when the subscription becomes active.
    /// </summary>
    public DateTimeOffset StartDate { get; set; }

    /// <summary>
    /// Gets or sets the date when the subscription ends or expires.
    /// </summary>
    public DateTimeOffset EndDate { get; set; }

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