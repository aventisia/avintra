namespace AccountsAPIs.Entities;

/// <summary>
/// Defines a credit-based pricing plan linked to a specific AI or communication service.
/// Specifies how credits are consumed based on unit type and usage quantity.
/// </summary>
public class CreditPlan : BaseEntity
{
    /// <summary>
    /// Gets or sets the name of the credit plan.
    /// e.g. "On-prem GPU-text".
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the associated service type for this credit plan.
    /// e.g. CreditServiceTypesEnum.OnPremGpuText.
    /// </summary>
    public CreditServiceTypesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the unit type used for measuring usage.
    /// e.g. UnitTypesEnum.Seconds, UnitTypesEnum.Tokens, or UnitTypesEnum.Message.
    /// </summary>
    public required UnitTypesEnum UnitType { get; set; }

    /// <summary>
    /// Gets or sets the quantity represented by a single unit.
    /// e.g. 30 (seconds), 1000 (tokens), or 1 (message).
    /// </summary>
    public int OneUnit { get; set; }

    /// <summary>
    /// Gets or sets the number of credits consumed per unit.
    /// e.g. 15, 3, or 0 if the service is included.
    /// </summary>
    public int Credits { get; set; }
}
