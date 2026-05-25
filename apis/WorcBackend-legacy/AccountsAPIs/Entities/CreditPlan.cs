namespace AccountsAPIs.Entities;

/// <summary>
/// Represents a pricing plan that uses credits for a specific AI or communication service.
/// Describes how credits are used based on the type and amount of usage.
/// </summary>
public class CreditPlan : BaseEntity
{
    /// <summary>
    /// Gets or sets the type of service this plan applies to
    /// </summary>
    public required CreditServiceTypesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the type of unit used to measure usage, like seconds, tokens, or messages.
    /// </summary>
    public required UnitTypesEnum UnitType { get; set; }

    /// <summary>
    /// Gets or sets how much usage is in one unit, like 30 seconds or 1000 tokens.
    /// </summary>
    public double OneUnit { get; set; }

    /// <summary>
    /// Gets or sets how many credits are used for each unit.
    /// </summary>
    public double Credits { get; set; }
}
