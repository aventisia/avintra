namespace AspNetToolkit.Enums;

/// <summary>
/// Specifies the different types of entities that can be published.
/// </summary>
public enum PublishTypesEnum
{
    /// <summary>
    /// A standalone agent that can be published.
    /// </summary>
    Agent,

    ChatAgent,

    /// <summary>
    /// A single functional block within a flow.
    /// </summary>
    Block,

    /// <summary>
    /// A reusable template based on an agent.
    /// </summary>
    AgentTemplate,

    /// <summary>
    /// A reusable template based on a block.
    /// </summary>
    BlockTemplate
}
