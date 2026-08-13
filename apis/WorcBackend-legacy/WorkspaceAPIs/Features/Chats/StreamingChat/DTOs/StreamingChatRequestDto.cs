using System.Text.Json.Serialization;

namespace WorkspaceAPIs.Features.Chats.StreamingChat.DTOs;

/// <summary>
/// Incoming request for a streaming chat completion against a Chat Agent flow.
/// The Chat AI node configuration (model/prompt/tools/skills) is resolved
/// server-side from the flow version's ReactFlow object, so the client only
/// needs to send the conversation context.
/// </summary>
public class StreamingChatRequestDto
{
    /// <summary>Flow version that owns the Chat AI node configuration.</summary>
    [RequiredGuid]
    public Guid FlowVersionId { get; set; }

    /// <summary>
    /// Existing conversation id, or null to allocate a new one.
    /// Persisted conversations use this to keep context across turns.
    /// </summary>
    public Guid? ConversationId { get; set; }

    /// <summary>
    /// Ordered chat messages already exchanged (excluding the current user turn,
    /// which is passed separately as <see cref="UserInput"/>). Used to seed history
    /// when no conversation_id is provided or the checkpoint is empty.
    /// </summary>
    public List<ChatMessageItem>? ThreadMessages { get; set; }

    /// <summary>The latest user message text.</summary>
    public string? UserInput { get; set; }

    /// <summary>Base64 / data-URL or http(s) file references to attach to the current turn.</summary>
    public List<string>? Files { get; set; }

    /// <summary>
    /// When true, the conversation is kept in-memory only (Studio test panel).
    /// When false (Assist), messages are persisted to the workspace DB.
    /// </summary>
    [JsonPropertyName("isTempChat")]
    public bool IsTempChat { get; set; }
}

/// <summary>A single role/content message in a conversation thread.</summary>
public class ChatMessageItem
{
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
