namespace AccountsAPIs.Enums;

/// <summary>
/// Represents the lifecycle status of a subscription plan within the system.
/// </summary>
public enum PlanStatusTypesEnum
{
    /// <summary>
    /// A custom plan created to meet specific business or client needs.
    /// </summary>
    [Description("Custom plan created for specific use cases.")]
    Custom,

    /// <summary>
    /// The active plan currently offered for new subscriptions or upgrades.
    /// </summary>
    [Description("Currently available and supported plan.")]
    Current,

    /// <summary>
    /// A deprecated plan still in use by existing subscribers but no longer offered to new customers.
    /// </summary>
    [Description("Outdated but still active for some users.")]
    Legacy,

    /// <summary>
    /// A retired plan kept solely for reference; unavailable for new assignments or subscriptions.
    /// </summary>
    [Description("Archived and unavailable for selection.")]
    Archived
}
