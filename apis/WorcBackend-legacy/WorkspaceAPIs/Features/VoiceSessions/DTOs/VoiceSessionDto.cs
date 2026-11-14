namespace WorkspaceAPIs.Features.VoiceSessions.DTOs;

/// <summary>
/// Caller join details for one LiveKit voice session.
/// </summary>
public sealed class VoiceSessionDto
{
    /// <summary>The LiveKit room the caller joins.</summary>
    [JsonPropertyName("roomName")]
    public string RoomName { get; init; } = string.Empty;

    /// <summary>The LiveKit WebSocket URL the caller connects to.</summary>
    [JsonPropertyName("serverUrl")]
    public string ServerUrl { get; init; } = string.Empty;

    /// <summary>The caller's short-lived LiveKit join token.</summary>
    [JsonPropertyName("clientToken")]
    public string ClientToken { get; init; } = string.Empty;

    /// <summary>The caller token lifetime in seconds.</summary>
    [JsonPropertyName("expiresIn")]
    public int ExpiresIn { get; init; }

    /// <summary>The conversation bound to this session.</summary>
    [JsonPropertyName("conversationId")]
    public string ConversationId { get; init; } = string.Empty;

    /// <summary>The dispatched worker agent name.</summary>
    [JsonPropertyName("agentName")]
    public string AgentName { get; init; } = string.Empty;

    /// <summary>The session mode the caller requested.</summary>
    [JsonPropertyName("mode")]
    public string Mode { get; init; } = "live";

    /// <summary>The resolved noise-cancellation mode.</summary>
    [JsonPropertyName("noiseCancellation")]
    public string NoiseCancellation { get; init; } = "none";
}
