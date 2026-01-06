namespace WorkspaceAPIs.Enums;

/// <summary>
/// Enum representing the types of models in the Ollama system.
/// </summary>
public enum OllamaModelTypeEnum
{
    /// <summary>
    /// A model designed for cloud-based operations.
    /// </summary>
    [Description("A model designed for cloud-based operations.")]
    Cloud,

    /// <summary>
    /// A model that works with embeddings in machine learning or NLP tasks.
    /// </summary>
    [Description("A model that works with embeddings in machine learning or NLP.")]
    Embedding,

    /// <summary>
    /// A model used for computer vision tasks, like image recognition.
    /// </summary>
    [Description("A model used for computer vision tasks.")]
    Vision,

    /// <summary>
    /// A model designed for specific tool-based tasks or utilities.
    /// </summary>
    [Description("A model designed for tool-based tasks or utilities.")]
    Tool,

    /// <summary>
    /// A model that mimics thinking, reasoning, or decision-making.
    /// </summary>
    [Description("A model that mimics thinking or decision-making.")]
    Thinking,

    /// <summary>
    /// A model that doesn’t fall into the other categories.
    /// </summary>
    [Description("A model that doesn’t fall into the other categories.")]
    Other
}