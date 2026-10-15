namespace AspNetToolkit.Enums;

/// <summary>
/// Specifies the various action types that can be performed within the system.
/// </summary>
public enum ActionTypesEnum
{
    /// <summary>
    /// Indicates an action where an agent is triggered to execute.
    /// </summary>
    [Description("Agent Execution")]
    AgentExecution,

    /// <summary>
    /// Indicates an action where template description generation is performed.
    /// </summary>
    [Description("Template Description Generation")]
    TemplateDescriptionGeneration,

    /// <summary>
    /// Indicates an action where a custom UI builder version is generated.
    /// </summary>
    [Description("UiBuilder Generation")]
    UiBuilderGeneration
}
