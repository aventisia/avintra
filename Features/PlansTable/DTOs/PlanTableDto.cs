namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a tenant record
/// </summary>
public class PlanTableDto
{
    /// <summary>
    /// Unique identifier for the tenant.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the tenant associated with this pricing plan.
    /// </summary>
    public Guid? TenantId { get; set; } = Guid.Empty;

    /// <summary>
    /// Gets or sets the unique identifier for the tenant associated with this pricing plan.
    /// </summary>
    public string? TenantName { get; set; } = "Default";

    /// <summary>
    /// Gets or sets the type of tenant associated with this pricing plan.
    /// </summary>
    public TenantTypesEnum? TenantType { get; set; }

    /// <summary>
    /// Gets or sets the name of the pricing component.
    /// </summary>
    [Required]
    public required PricingComponentsEnum PricingComponent { get; set; }

    /// <summary>
    /// Gets or sets the currency used for the pricing plan, with a default value of USD.
    /// </summary>
    [Required]
    public required CurrencyTypesEnum Currency { get; set; }

    /// <summary>
    /// Gets or sets the price per unit for the pricing plan.
    /// </summary>
    [Required]
    public required double UnitPrice { get; set; }

    /// <summary>
    /// Gets or sets the type of unit associated with the pricing plan (e.g., Credit or License).
    /// This indicates the quantity relevant to the specified unit type.
    /// </summary>
    public UnitTypesEnum? Unit { get; set; }

    /// <summary>
    /// Gets or sets the billing frequency for the pricing plan (e.g., monthly, yearly).
    /// </summary>
    public FrequencyTypesEnum? Frequency { get; set; } = FrequencyTypesEnum.NA

    /// <summary>
    /// Gets or sets the Cost of Living Adjustment (COLA) applicable to the pricing plan.
    /// This adjustment is used to account for inflation and changes in living costs.
    /// </summary>
    [Required, Range(0, 100)]
    public required double COLA { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    /// <remarks>
    /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the user record. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the user record.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the user record was last modified. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
