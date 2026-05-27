namespace AspNetToolkit.Enums;

/// <summary>
/// Specifies the types of sources or entities that can consume credits,
/// such as Agents.
/// </summary>
public enum UsageSourceTypesEnum
{
    /// <summary>
    /// Indicates that the credits were used by or for an Agent.
    /// </summary>
    [Description("Agent")]
    Agent,

    AIModel, // TODO (Remove ai-studio task): Deprecated services (to be removed after data migration)

    /// <summary>
    /// Indicates that the credits were consumed by the platform itself.
    /// </summary>
    [Description("Platform")]
    Platform
}