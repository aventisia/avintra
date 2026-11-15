namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the types of Flow. <br/>
/// </summary>
/// <remarks>
/// IMPORTANT NOTE: Any changes to this file should be manually synced with front-end enum file and
/// should be in sync with the enum values in the existing records in the database. <br/>
/// </remarks>
public enum FlowTypesEnum
{
    /// <summary>
    /// Represents an agent flow type.
    /// </summary>
    Agent,

    ChatAgent,

    /// <summary>
    /// Represents a block flow type.
    /// </summary>
    Block,

    /// <summary>
    /// Represents a voice agent flow type.
    /// </summary>
    VoiceAgent
}