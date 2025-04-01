namespace AccountsAPIs.Enums;

/// <summary>
/// Represents the different billing frequencies available for pricing plans.
/// </summary>
public enum FrequencyTypesEnum
{
    /// <summary>
    /// Indicates billing occurs on a monthly basis.
    /// </summary>
    Monthly,

    /// <summary>
    /// Indicates billing occurs on a quarterly basis.
    /// </summary>
    Quarterly,

    /// <summary>
    /// Indicates billing occurs on a yearly basis.
    /// </summary>
    Yearly,

    /// <summary>
    /// Indicates a one-time billing event.
    /// </summary>
    OneTime
}
