namespace AspNetToolkit.Enums;
/// <summary>
/// Specifies the various types of participants that can be involved in a conversation.
/// </summary>
public enum ParticipantTypesEnum
{
    /// <summary>
    /// A participant representing a human user engaged in the conversation.
    /// </summary>
    [Description("Human user")]
    User,

    /// <summary>
    /// A participant representing an automated bot interacting in the conversation.
    /// </summary>
    [Description("Automated bot")]
    Bot,

    /// <summary>
    /// A participant representing an automated system or service interacting in the conversation.
    /// </summary>
    [Description("Automation system")]
    Automation,

    /// <summary>
    /// A participant representing a system-generated or machine learning model-generated message.
    /// </summary>
    [Description("System-generated message")]
    System
}