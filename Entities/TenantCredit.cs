namespace AccountsAPIs.Entities;

/// <summary>
/// Represents the credit allocated to a tenant for a specific subscription period (monthly or yearly).
/// </summary>
public class TenantCredit : BaseEntity
{
    /// <summary>
    /// Gets or sets the unique identifier of the tenant to whom the credit is assigned.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the amount of credit available to the tenant for the specified subscription period.
    /// </summary>
    public double AvailableCredits { get; set; }

    /// <summary>
    /// Gets or sets the date when the credit was issued or applied to the tenant's account.
    /// </summary>
    public DateTimeOffset CreditedOn { get; set; }

    /// <summary>
    /// Gets or sets the date when the credit expires and can no longer be used.
    /// </summary>
    public DateTimeOffset ExpiredOn { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the subscription associated with this credit.
    /// </summary>
    public Guid SubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property to the tenant's subscription associated with this credit.
    /// </summary>
    [ForeignKey("SubscriptionId")]
    public virtual TenantSubscription? TenantSubscription { get; set; }
}
