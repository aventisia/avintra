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

    /// <summary>
    /// A modular or block-based project template.
    /// </summary>
    Block,

    /// <summary>
    /// A project template focused on data-driven or predictive tasks.
    /// </summary>
    Inferencing,

    /// <summary>
    /// A project template built for conversational systems or chatbots.
    /// </summary>
    Conversation,

    /// <summary>
    /// A project template for generating content such as text or images.
    /// </summary>
    Generative
}
