namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the project types list. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file.
/// </remarks>
public enum AIProjectTypeEnum
{
    /// <summary>
    /// Represents a project focused on inferencing tasks.
    /// </summary>
    Inferencing,

    /// <summary>
    /// Represents a project focused on conversation generation or dialogue systems or persona.
    /// </summary>
    Conversational,

    /// <summary>
    /// Represents a project focused on generative tasks, such as content creation or data synthesis.
    /// </summary>
    Generative
}