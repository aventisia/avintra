namespace AspNetToolkit.Enums;

/// <summary>
/// Defines the different levels of access a user can have on an agent (flow).
/// </summary>
public enum AgentAccessTypesEnum
{
    /// <summary>
    /// Grants full control over the agent, including management and modifications.
    /// </summary>
    Owner,

    /// <summary>
    /// Provides read-only access to the agent, allowing the user to view but not make changes.
    /// </summary>
    Viewer,

    /// <summary>
    /// Allows the user to edit or update the agent, but not to manage ownership or delete it.
    /// </summary>
    Editor,
}