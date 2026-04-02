namespace WorkspaceAPIs.Enums;

/// <summary>
/// Represents the lifecycle state of a conversation.
/// </summary>
public enum ConversationStatusTypes
{
    /// <summary>
    /// Conversation is active and can receive/send messages.
    /// </summary>
    Active,

    /// <summary>
    /// Conversation completed normally (no ongoing activity).
    /// </summary>
    Completed,

    /// <summary>
    /// Conversation encountered an error during processing.
    /// </summary>
    Failed,

    /// <summary>
    /// User lost access to the associated FlowVersion (agent). Conversation becomes inaccessible after current session.
    /// </summary>
    AccessRevoked,

    /// <summary>
    /// Conversation is archived by the user (read-only state).
    /// </summary>
    Archived
}