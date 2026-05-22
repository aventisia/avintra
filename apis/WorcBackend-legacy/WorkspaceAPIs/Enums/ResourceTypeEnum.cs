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
    /// Represents a key store resource used for storing keys and configuration values.
    /// </summary>
    [Description("Represents a key store resource used for storing keys and configuration values.")]
    KeyStore,

    /// <summary>
    /// Represents a vault resource used for securely storing sensitive information.
    /// </summary>
    [Description("Represents a vault resource used for securely storing sensitive information.")]
    Vault,

    /// <summary>
    /// Represents an application secret resource used for managing application credentials.
    /// </summary>
    [Description("Represents an application secret resource used for managing application credentials.")]
    AppSecret,

    /// <summary>
    /// Represents a knowledge base resource used for storing and retrieving knowledge assets.
    /// </summary>
    [Description("Represents a knowledge base resource used for storing and retrieving knowledge assets.")]
    KnowledgeBase
}