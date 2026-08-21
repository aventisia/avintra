namespace WorkspaceAPIs.DTOs;

/// <summary>
/// A third-party tool used by the agent, resolved from the flow config at save-time.
/// </summary>
public class ThirdPartyToolDto
{
    /// <summary>
    /// The tool name.
    /// </summary>
    public string? Tool { get; set; }

    /// <summary>
    /// The credential name referenced by the node.
    /// </summary>
    public string? CredentialName { get; set; }

    /// <summary>
    /// The actions configured on the tool (comma-separated).
    /// </summary>
    public string? Actions { get; set; }

    /// <summary>
    /// Whether due diligence has been completed (human input).
    /// </summary>
    public bool IsDueDiligenceCompleted { get; set; }

    /// <summary>
    /// Due-diligence status text (human input).
    /// </summary>
    public string? DueDiligenceStatus { get; set; }

    /// <summary>
    /// Specific risks associated with this tool (human input).
    /// </summary>
    public string? Risks { get; set; }

    /// <summary>
    /// Mitigations for the above risks (human input).
    /// </summary>
    public string? Mitigations { get; set; }
}
