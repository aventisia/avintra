namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the available resubscription frequency options.
/// </summary>
public enum ResubscribeFrequencyEnum
{
    /// <summary>
    /// Resubscribe every 30 days.
    /// </summary>
    [Description("30 Days")]
    Days30,

    /// <summary>
    /// Resubscribe every 90 days.
    /// </summary>
    [Description("90 Days")]
    Days90,

    /// <summary>
    /// Resubscribe every 180 days.
    /// </summary>
    [Description("180 Days")]
    Days180,

    /// <summary>
    /// Resubscribe every 365 days.
    /// </summary>
    [Description("365 Days")]
    Days365,

    /// <summary>
    /// Custom resubscribe duration defined by the user.
    /// </summary>
    [Description("Custom")]
    Custom
}