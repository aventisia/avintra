namespace WorkspaceAPIs.Enums;

/// <summary>
/// Defines the supported resource types that can be shared and assigned access permissions.
/// </summary>
public enum ResourceTypeEnum
{
    /// <summary>
    /// Represents a queue resource used for managing work items.
    /// </summary>
    [Description("Represents a queue resource used for managing work items.")]
    Queue,

    /// <summary>
    /// Represents a trigger resource used to initiate workflows or actions.
    /// </summary>
    [Description("Represents a trigger resource used to initiate workflows or actions.")]
    Trigger,

    /// <summary>
    /// Represents a config store resource used for storing keys and configuration values.
    /// </summary>
    [Description("Represents a config store resource used for storing keys and configuration values.")]
    ConfigStore,

    /// <summary>
    /// Represents a vault credential resource.
    /// </summary>
    [Description("Represents a vault credential resource.")]
    VaultCredential,

    /// <summary>
    /// Represents a knowledge base resource used for storing and retrieving knowledge assets.
    /// </summary>
    [Description("Represents a knowledge base resource used for storing and retrieving knowledge assets.")]
    KnowledgeBase,

    /// <summary>
    /// Represents a flow resource used to define and execute workflow logic.
    /// </summary>
    [Description("Represents a flow resource used to define and execute workflow logic.")]
    Flow,

    /// <summary>
    /// Represents a specific version of a flow resource used for versioned workflow execution and management.
    /// </summary>
    [Description("Represents a specific version of a flow resource used for versioned workflow execution and management.")]
    FlowVersion,

    /// <summary>
    /// Represents a skill registry resource used for storing and sharing reusable skills and scripts.
    /// </summary>
    [Description("Represents a skill registry resource used for storing and sharing reusable skills and scripts.")]
    Skill,

    /// <summary>
    /// Represents a tool resource used for registering custom REST APIs as LLM-callable tools.
    /// </summary>
    [Description("Represents a tool resource used for registering custom REST APIs as LLM-callable tools.")]
    Tool,

    /// <summary>
    /// Represents a space resource used for scoping access to a logical container.
    /// </summary>
    [Description("Represents a space resource used for scoping access to a logical container.")]
    Space
}