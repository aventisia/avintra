namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the source/type of a workspace component.
/// </summary>
public enum ComponentTypeEnum
{
    /// <summary>
    /// A built-in platform-managed component.
    /// </summary>
    [Description("Platform")]
    Platform,

    /// <summary>
    /// A user-defined custom component.
    /// </summary>
    [Description("Custom")]
    Custom,
}