namespace AccountsAPIs.DTOs;

/// <summary>
/// Defines a data transfer object that encapsulates information about a tenant's licensing credits, 
/// including allocation, consumption, billing details, and metadata about the tenant.
/// </summary>
public class ManageLicenseCreditDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the associated license credit.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique ID of the tenant associated with this pricing plan.
    /// </summary>
    public Guid? TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the tenant linked to this pricing plan.
    /// </summary>
    public string? TenantName { get; set; }

    /// <summary>
    /// Gets or sets the type of tenant associated with this pricing plan.
    /// </summary>
    public TenantTypesEnum? TenantType { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the pricing plan related to this tenant.
    /// </summary>
    [Required]
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the name of the pricing plan connected to this tenant.
    /// </summary>
    public PricingComponentsEnum? PricingComponent { get; set; }

    /// <summary>
    /// Gets or sets the price per unit for the pricing plan.
    /// </summary>
    public double? UnitPrice { get; set; }

    /// <summary>
    /// Gets or sets the type of unit associated with the pricing plan (e.g., Credit or License).
    /// This indicates the quantity relevant to the specified unit type.
    /// </summary>
    public UnitTypesEnum? Unit { get; set; }

    /// <summary>
    /// Gets or sets the currency used for the pricing plan, with a default value of USD.
    /// </summary>
    public CurrencyTypesEnum? Currency { get; set; }

    /// <summary>
    /// Gets or sets the total number of units allocated to the tenant or user.
    /// </summary>
    public int Allocated { get; set; }

    /// <summary>
    /// Gets or sets the number of units that have been consumed.
    /// </summary>
    public int Consumed { get; set; }

    /// <summary>
    /// Gets or sets the number of remaining units available for use.
    /// </summary>
    public int Available { get; set; }

    /// <summary>
    /// Gets or sets the date of the next billing cycle for this pricing entity.
    /// </summary>
    public DateTime NextBillingDate { get; set; }

    /// <summary>
    /// Gets or sets the status of the license credit.
    /// </summary>
    public LicenseCreditStatusesEnum? Status { get; set; }

    /// <summary>
    /// Gets or sets the number of additional units requested by the tenant or user.
    /// </summary>
    public int AdditionalUnitsRequested { get; set; }

    /// <summary>
    /// Gets or sets the amount of any overdue balance related to this pricing entity.
    /// </summary>
    public decimal? OverdueBalance { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the user account is disabled.
    /// </summary>
    /// <remarks>
    /// This property is nullable to distinguish between true, false, and null values.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the person who created the user record. 
    /// This property is for response purposes only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// This property is for response purposes only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the individual who last modified the record.
    /// This property is for response purposes only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// This property is for response purposes only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
