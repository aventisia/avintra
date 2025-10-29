namespace AspNetToolkit.Enums;

/// <summary>
/// Specifies the various action types that can be performed within the system.
/// </summary>
public enum ActionTypesEnum
{
    /// <summary>
    /// Indicates an action where an AI agent is triggered to execute.
    /// </summary>
    [Description("Agent Execution")]
    AgentExecution,

    /// <summary>
    /// Indicates an action where an AI model is triggered to execute.
    /// </summary>
    [Description("AI Model Execution")]
    AIModelExecution
}
