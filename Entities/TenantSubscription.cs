namespace AccountsAPIs.Entities;

/// <summary>
/// Represents a tenant's subscription to a specific plan, including start and end dates.
/// </summary>
public class TenantSubscription : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the ID of the tenant using the subscription.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the date the subscription becomes active.
    /// </summary>
    public DateTime StartDate { get; set; }

    /// <summary>
    /// Gets or sets the date the subscription ends.
    /// </summary>
    public DateTime EndDate { get; set; }

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