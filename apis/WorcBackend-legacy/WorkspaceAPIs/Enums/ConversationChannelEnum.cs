namespace WorkspaceAPIs.Enums;

/// <summary>
/// Identifies the client channel that created a conversation.
/// </summary>
public enum ConversationChannelEnum
{
    /// <summary>
    /// Conversation created through the text chat channel.
    /// </summary>
    Chat,

    /// <summary>
    /// Conversation created through the voice channel.
    /// </summary>
    Voice,
}
