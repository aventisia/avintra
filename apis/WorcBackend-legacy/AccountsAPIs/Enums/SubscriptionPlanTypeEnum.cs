namespace AccountsAPIs.Enums;

/// <summary>
/// Defines the different types of subscription plans a user can have.
/// </summary>
public enum SubscriptionPlanTypeEnum
{
    /// <summary>
    /// A starter plan that includes only essential features.
    /// </summary>
    [Description("Starter plan with essential features")]
    Starter,

    /// <summary>
    /// A paid plan with more features for individual users or small teams.
    /// </summary>
    [Description("Paid plan with more features for individuals or small teams")]
    Pro,

    /// <summary>
    /// A placeholder value indicating no subscription plan is assigned or available.
    /// </summary>
    [Description("No subscription plan assigned")]
    None,

    // TODO: Remove 'Enterprise' and 'Commercial' plans once they are no longer needed
    /// <summary>
    /// A full-featured plan designed for large businesses or organizations.
    /// </summary>
    [Description("Full-featured plan for businesses or organizations")]
    Enterprise,

    /// <summary>
    /// A commercial plan designed for large-scale business use or high-volume transactions.
    /// </summary>
    [Description("Commercial plan for large-scale business or high-volume use")]
    Commercial
}