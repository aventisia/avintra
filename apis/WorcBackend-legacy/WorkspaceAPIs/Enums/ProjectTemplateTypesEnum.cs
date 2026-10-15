namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the types of project templates available in the workspace.
/// </summary>
public enum ProjectTemplateTypesEnum
{
    /// <summary>
    /// A project template managed by an agent.
    /// </summary>
    Agent,

    ChatAgent,

    /// <summary>
    /// A modular or block-based project template.
    /// </summary>
    Block,

    /// <summary>
    /// A template type used for prompts or keyword-based templates.
    /// </summary>
    Prompt,

    /// <summary>
    /// A voice-agent project template.
    /// </summary>
    VoiceAgent
}
