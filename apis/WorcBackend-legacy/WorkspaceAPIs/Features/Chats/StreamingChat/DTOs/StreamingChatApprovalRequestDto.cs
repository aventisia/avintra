using System.Text.Json.Serialization;

namespace WorkspaceAPIs.Features.Chats.StreamingChat.DTOs;

/// <summary>
/// Resumes a chat turn that is paused on human tool approval. Each decision is
/// keyed by the <c>tool_call_id</c> surfaced in the "approval_required" SSE frame.
/// </summary>
public class StreamingChatApprovalRequestDto
{
    /// <summary>Flow version that owns the Chat AI node configuration.</summary>
    [RequiredGuid]
    public Guid FlowVersionId { get; set; }

    /// <summary>Conversation with the paused turn being resumed.</summary>
    [RequiredGuid]
    public Guid ConversationId { get; set; }

    /// <summary>
    /// When true, the conversation is kept in-memory only (Studio test panel).
    /// Must match the value used for the original streaming request.
    /// </summary>
    [JsonPropertyName("isTempChat")]
    public bool IsTempChat { get; set; }

    /// <summary>User decisions for the pending tool calls.</summary>
    public List<ApprovalDecisionItem>? Decisions { get; set; }
}

/// <summary>A single approve/deny decision for a pending tool call.</summary>
public class ApprovalDecisionItem
{
    /// <summary>Identifies the tool call from the approval_required frame.</summary>
    public string ToolCallId { get; set; } = string.Empty;

    /// <summary>"approve" to execute the action, otherwise the call is denied.</summary>
    public string Decision { get; set; } = string.Empty;
}
