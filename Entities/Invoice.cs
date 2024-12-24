namespace AccountsAPIs.Entities;

public class Invoice : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the Id of a Subscription, this Invoice is associated with
    /// </summary>
    public Guid SubscriptionId { get; set; }
    [ForeignKey("SubscriptionId")]
    public virtual Subscription? Subscription { get; set; }

    /// <summary>
    /// Gets or sets the Amount
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Gets or sets the GeneratedDate
    /// </summary>
    public DateTime GeneratedDate { get; set; }

    /// <summary>
    /// Gets or sets the IsPaid
    /// </summary>
    public bool IsPaid { get; set; }

    public virtual ICollection<Payment>? Payment { get; set; }
}