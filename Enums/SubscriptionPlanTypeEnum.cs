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
    /// A full-featured plan designed for large businesses or organizations.
    /// </summary>
    [Description("Full-featured plan for businesses or organizations")]
    Enterprise
}