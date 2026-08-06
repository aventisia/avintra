namespace WorkspaceAPIs.Enums;

/// <summary>
/// Enum representing the risk level of a support ticket.
/// </summary>
public enum RiskLevelEnum
{
    /// <summary>
    /// Low risk ticket.
    /// </summary>
    [Description("Low risk ticket.")]
    Low,

    /// <summary>
    /// Medium risk ticket.
    /// </summary>
    [Description("Medium risk ticket.")]
    Medium,

    /// <summary>
    /// High risk ticket.
    /// </summary>
    [Description("High risk ticket.")]
    High
}
