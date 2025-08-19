namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a tenant's subscription details, including plan info, active period,
/// status, and metadata for auditing purposes.
/// </summary>
public class TenantSubscriptionDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the tenant subscription.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the tenant using the subscription.
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// Gets or sets the date when the subscription becomes active.
    /// </summary>
    public DateTimeOffset StartDate { get; set; }

    /// <summary>
    /// Gets or sets the date when the subscription ends or expires.
    /// </summary>
    public DateTimeOffset EndDate { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the subscription is currently active.
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets the display name of the subscription plan (e.g., Free, Pro, Enterprise).
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the linked subscription plan.
    /// </summary>
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the subscription plan is disabled.
    /// Nullable to allow for enabled, disabled, or undefined states.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the name of the user who created the subscription.
    /// For display or audit purposes only.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of when the subscription was created.
    /// For audit and tracking purposes.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the name of the user who last updated the subscription.
    /// For display or audit purposes only.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the timestamp of the most recent update to the subscription.
    /// For audit and tracking purposes.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
