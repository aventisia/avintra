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

    AIProject, // TODO (Remove ai-studio task): Remove it after database data migration is done, as this type is no longer used.

    /// <summary>
    /// A template type used for prompts or keyword-based templates.
    /// </summary>
    Prompt
}
