namespace WorkspaceAPIs.Enums;

/// <summary>
/// Enum representing the complexity level of a support ticket.
/// </summary>
public enum ComplexityEnum
{
    /// <summary>
    /// Low complexity ticket.
    /// </summary>
    [Description("Low complexity ticket.")]
    Low,

    /// <summary>
    /// Medium complexity ticket.
    /// </summary>
    [Description("Medium complexity ticket.")]
    Medium,

    /// <summary>
    /// High complexity ticket.
    /// </summary>
    [Description("High complexity ticket.")]
    High
}
