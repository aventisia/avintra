namespace AccountsAPIs.Enums;

/// <summary>
/// Represents a pricing entity that manages the allocation, usage,
/// and billing details for different pricing components associated with a tenant or user.
/// </summary>
public class LicenseCredit : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the primary key for the tenant record, allowing global filtering in a multi-tenant environment.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Represents the type of pricing component (e.g., AI Agent, GPU Compute).
    /// </summary>
    [Required]
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the status of the license credit.
    /// </summary>
    public LicenseCreditStatusesEnum? Status { get; set; }

    /// <summary>
    /// The total number of units allocated to the tenant or user.
    /// </summary>
    public int Allocated { get; set; }

    /// <summary>
    /// The number of units that have been used.
    /// </summary>
    public int Consumed { get; set; }

    /// <summary>
    /// The number of remaining units available for use.
    /// </summary>
    public int Available { get; set; }

    /// <summary>
    /// The date of the upcoming billing cycle for this pricing entity.
    /// </summary>
    public DateTime? NextBillingDate { get; set; }

    /// <summary>
    /// The number of additional units requested by the tenant or user.
    /// </summary>
    public int AdditionalUnitsRequested { get; set; }

    /// <summary>
    /// Gets or sets the tenant related to this pricing plan.
    /// </summary>
    [ForeignKey("PlanId")]
    public virtual PlanPricing? PlanPricing { get; set; }

    // /// <summary>
    // /// Gets or sets the collection of billing accounts associated with this pricing plan.
    // /// </summary>
    // public virtual ICollection<BillingAccount>? BillingAccounts { get; set; }
}
