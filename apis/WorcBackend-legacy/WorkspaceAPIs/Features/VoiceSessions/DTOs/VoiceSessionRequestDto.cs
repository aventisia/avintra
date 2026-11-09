namespace WorkspaceAPIs.Features.VoiceSessions.DTOs;

/// <summary>
/// Authorized request for one VoiceAgent session.
/// </summary>
public sealed class VoiceSessionRequestDto
{
    /// <summary>The flow version the caller wants to speak to.</summary>
    [RequiredGuid]
    [JsonPropertyName("flowVersionId")]
    public Guid FlowVersionId { get; init; }

    /// <summary>The session mode: <c>test</c> for the draft, <c>live</c> for the published agent.</summary>
    [JsonPropertyName("mode")]
    public string Mode { get; init; } = "live";
}
