namespace AccountsAPIs.Entities;

[Table("PlanPricings")]
public class PlanPricing : BaseEntity
{
    /// <summary>
    /// Gets or sets the name of the pricing component.
    /// </summary>
    [MaxLength(256), Required]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the currency for the pricing plan, defaulting to USD.
    /// </summary>
    [Required]
    public required CurrencyTypesEnum Currency { get; set; }

    /// <summary>
    /// Gets or sets the price per unit for the pricing plan.
    /// </summary>
    [Required]
    public required double UnitPrice { get; set; }

    /// <summary>
    /// Gets or sets the type of unit linked to the pricing plan (e.g., Credit or License).
    /// This represents the quantity relevant to the specified unit type.
    /// </summary>
    [Required]
    public required UnitTypesEnum Unit { get; set; }

    /// <summary>
    /// Gets or sets the billing frequency for the pricing plan (e.g., monthly, yearly).
    /// </summary>
    public required FrequencyTypesEnum Frequency { get; set; }

    /// <summary>
    /// Gets or sets the Cost of Living Adjustment (COLA) applicable to the pricing plan.
    /// This adjustment is used to account for inflation and changes in living costs.
    /// </summary>
    [Range(0, 100)]
    public required double COLA { get; set; }

    /// <summary>
    /// Gets or sets the type of tenant associated with this pricing plan.
    /// </summary>
    public TenantTypesEnum? TenantType { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the tenant associated with this pricing plan.
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// Gets or sets the tenant related to this pricing plan.
    /// </summary>
    [ForeignKey("TenantId")]
    public virtual Tenant? Tenant { get; set; }

    /// <summary>
    /// Gets or sets the collection of subscriptions associated with this pricing plan.
    /// </summary>
    public virtual ICollection<Subscription>? Subscriptions { get; set; }
}
