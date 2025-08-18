namespace AccountsAPIs.Entities;

/// <summary>
/// Links a tenant to a subscription plan, tracking its active start and end dates.
/// </summary>
public class TenantSubscription : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant’s unique identifier for this subscription.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the date the subscription starts and becomes active.
    /// </summary>
    public DateTime? StartDate { get; set; }

    /// <summary>
    /// Gets or sets the date the subscription ends or expires.
    /// </summary>
    public DateTime? EndDate { get; set; }

    /// <summary>
    /// Gets or sets the ID of the linked subscription plan.
    /// </summary>
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property to the subscription plan details.
    /// </summary>
    [ForeignKey("PlanId")]
    public virtual SubscriptionPlan? Plan { get; set; }
}
