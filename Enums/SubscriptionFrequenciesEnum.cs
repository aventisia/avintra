namespace AccountsAPIs.Enums;

/// <summary>
/// Specifies the available durations for subscription plans.
/// </summary>
public enum SubscriptionFrequenciesEnum
{
    /// <summary>
    /// A subscription plan that renews on a monthly basis.
    /// </summary>
    [Description("A subscription plan that renews on a monthly basis.")]
    Monthly,

    /// <summary>
    /// A subscription plan that renews on a yearly basis.
    /// </summary>
    [Description("A subscription plan that renews on a yearly basis.")]
    Yearly
}