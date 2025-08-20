namespace AspNetToolkit.Enums;

/// <summary>
/// Specifies the types of sources or entities that can consume credits,
/// such as AI Agents or AI Models.
/// </summary>
public enum UsageSourceTypesEnum
{
    /// <summary>
    /// Indicates that the credits were used by or for an AI Agent.
    /// </summary>
    [Description("AI Agent")]
    Agent,

    /// <summary>
    /// Indicates that the credits were used by or for an AI Model.
    /// </summary>
    [Description("AI Model")]
    AIModel
}